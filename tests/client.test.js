const request = require("supertest");
const { app } = require("../index");
const mongoose = require("mongoose");

let token;
let clientId;
let archivedClientId;

beforeAll(async () => {
  await mongoose.connection.dropDatabase();

  // Registro de usuario
  const resRegister = await request(app).post("/api/users/register").send({
    email: "testcliente@email.com",
    password: "12345678",
  });
  token = resRegister.body.token;

  // Validar email
  const user = await mongoose.connection.collection("users").findOne({ email: "testcliente@email.com" });
  await request(app)
    .put("/api/users/validate-email")
    .set("Authorization", `Bearer ${token}`)
    .send({ code: user.verificationCode });

  // Onboarding
  await request(app)
    .put("/api/users/onboarding/personal-info")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Cliente", lastName: "Test", nif: "12345678A" });

  await request(app)
    .put("/api/users/onboarding/company-info")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empresa Cliente Test",
      cif: "B12345678",
      address: "Calle Cliente",
    });
});

describe("Endpoints de Clientes", () => {
  test("Crear cliente", async () => {
    const res = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Cliente Ejemplo",
        email: "cliente@example.com",
        nif: "87654321B",
        phone: "612345678",
        address: "Calle de Ejemplo",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Cliente Ejemplo");
    clientId = res.body._id;
  });

  test("Obtener clientes", async () => {
    const res = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Actualizar cliente", async () => {
    const res = await request(app)
      .put(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "699999999" });

    expect(res.statusCode).toBe(200);
    expect(res.body.phone).toBe("699999999");
  });

  test("Eliminar cliente (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(true);
    archivedClientId = clientId;
  });

  test("Obtener clientes archivados", async () => {
    const res = await request(app)
      .get("/api/clients/archived")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const archived = res.body.find((c) => c._id === archivedClientId);
    expect(archived).toBeDefined();
  });

  test("Restaurar cliente", async () => {
    const res = await request(app)
      .patch(`/api/clients/${archivedClientId}/recover`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.restored).toBe(true);
  });
});