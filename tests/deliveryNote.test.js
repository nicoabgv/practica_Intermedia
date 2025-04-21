const request = require("supertest");
const { app } = require("../index");
const mongoose = require("mongoose");
const path = require("path");

let token;
let clientId;
let projectId;
let noteId;

beforeAll(async () => {
  await mongoose.connection.dropDatabase();

  // Crear usuario y validar email
  const res = await request(app).post("/api/users/register").send({
    email: "delivery@email.com",
    password: "12345678",
  });
  token = res.body.token;

  const user = await mongoose.connection.collection("users").findOne({ email: "delivery@email.com" });
  await request(app)
    .put("/api/users/validate-email")
    .set("Authorization", `Bearer ${token}`)
    .send({ code: user.verificationCode });

  await request(app)
    .put("/api/users/onboarding/personal-info")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Técnico", lastName: "Notas", nif: "12345678Z" });

  await request(app)
    .put("/api/users/onboarding/company-info")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Empresa Albaranes",
      cif: "B99999999",
      address: "Calle Firma",
    });

  // Crear cliente
  const clientRes = await request(app)
    .post("/api/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Cliente de Prueba",
      nif: "12345678P",
      email: "cliente@test.com",
      phone: "600000000",
      address: "Calle Cliente",
    });
  clientId = clientRes.body._id;

  // Crear proyecto
  const projectRes = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Proyecto Albarán",
      client: clientId,
      description: "Proyecto para test de notas",
    });
  projectId = projectRes.body._id;
});

describe("Delivery Notes", () => {
  test("Crear albarán de tipo horas", async () => {
    const res = await request(app)
      .post("/api/delivery-notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "hours",
        project: projectId,
        persons: [
          { name: "Técnico 1", hours: 5 },
          { name: "Técnico 2", hours: 3 }
        ]
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe("hours");
    noteId = res.body._id;
  });

  test("Obtener todos los albaranes", async () => {
    const res = await request(app)
      .get("/api/delivery-notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("Obtener un albarán por ID", async () => {
    const res = await request(app)
      .get(`/api/delivery-notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(noteId);
  });

  test("Eliminar albarán (sin firmar)", async () => {
    const res = await request(app)
      .delete(`/api/delivery-notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});

describe("Firmar y generar PDF de albarán", () => {
  let signedNoteId;

  test("Crear nuevo albarán de tipo materials", async () => {
    const res = await request(app)
      .post("/api/delivery-notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "materials",
        project: projectId,
        materials: [
          { name: "Tornillos", quantity: 10 },
          { name: "Clavos", quantity: 50 }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe("materials");
    signedNoteId = res.body._id;
  });

  test("Firmar albarán subiendo imagen", async () => {
    const res = await request(app)
      .patch(`/api/delivery-notes/${signedNoteId}/sign`)
      .set("Authorization", `Bearer ${token}`)
      .attach("signature", path.join(__dirname, "full_logo_blc.png"));

    expect(res.statusCode).toBe(200);
    expect(res.body.note.signed).toBe(true);
  });

  test("Generar PDF del albarán firmado", async () => {
    const res = await request(app)
      .get(`/api/delivery-notes/pdf/${signedNoteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("PDF generado correctamente");
    expect(res.body.url).toContain(`/storage/pdfs/albaran-${signedNoteId}`);
  });
});