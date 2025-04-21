const request = require("supertest");
const { app } = require("../index");
const mongoose = require("mongoose");

let token;
let clientId;
let projectId;
let archivedProjectId;

beforeAll(async () => {
  await mongoose.connection.dropDatabase();

  // Registro de usuario
  const resRegister = await request(app).post("/api/users/register").send({
    email: "testproject@email.com",
    password: "12345678",
  });
  token = resRegister.body.token;

  // Validar email
  const user = await mongoose.connection.collection("users").findOne({ email: "testproject@email.com" });
  await request(app)
    .put("/api/users/validate-email")
    .set("Authorization", `Bearer ${token}`)
    .send({ code: user.verificationCode });

  // Onboarding
  await request(app)
    .put("/api/users/onboarding/personal-info")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Proyecto", lastName: "Test", nif: "12345678A" });

  await request(app)
    .put("/api/users/onboarding/company-info")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empresa Proyectos Test",
      cif: "B12345678",
      address: "Calle Empresa",
    });

  // Crear cliente asociado
  const clientRes = await request(app)
    .post("/api/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Cliente Proyecto",
      email: "cliente@proyecto.com",
      nif: "22222222A",
      phone: "699999999",
      address: "Calle Cliente",
    });
  clientId = clientRes.body._id;
});

describe("Endpoints de Proyectos", () => {
  test("Crear proyecto", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Proyecto A",
        description: "Descripción de prueba",
        client: clientId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Proyecto A");
    projectId = res.body._id;
  });

  test("Obtener todos los proyectos", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Obtener un proyecto por ID", async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(projectId);
  });

  test("Actualizar proyecto", async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Descripción actualizada" });

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe("Descripción actualizada");
  });

  test("Eliminar proyecto (soft delete)", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(true);
    archivedProjectId = projectId;
  });

  test("Obtener proyectos archivados", async () => {
    const res = await request(app)
      .get("/api/projects/archived")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const archived = res.body.find((p) => p._id === archivedProjectId);
    expect(archived).toBeDefined();
  });

  test("Restaurar proyecto", async () => {
    const res = await request(app)
      .patch(`/api/projects/${archivedProjectId}/recover`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.restored).toBe(true);
  });
});