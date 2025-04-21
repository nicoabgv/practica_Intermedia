const request = require("supertest");
const { app } = require("../index");
const User = require("../models/User");

let token;
let verificationCode;

const testUser = {
  email: "testuser@example.com",
  password: "TestPassword123"
};

beforeAll(async () => {
  await User.deleteMany({});
});

describe("Auth: Registro y Login", () => {
  test("Debe registrar un nuevo usuario", async () => {
    const res = await request(app).post("/api/users/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
    const userInDb = await User.findOne({ email: testUser.email });
    verificationCode = userInDb.verificationCode;
  });

  test("No debe registrar un usuario ya existente", async () => {
    const res = await request(app).post("/api/users/register").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  test("Debe validar el correo electrónico", async () => {
    const res = await request(app)
      .put("/api/users/validate-email")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: verificationCode });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Correo verificado correctamente");
  });

  test("Debe hacer login correctamente", async () => {
    const res = await request(app).post("/api/users/login").send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });
});

describe("Onboarding: Perfil del usuario", () => {
  test("Debe actualizar la información personal", async () => {
    const res = await request(app)
      .put("/api/users/onboarding/personal-info")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test",
        lastName: "User",
        nif: "12345678Z"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Test");
  });

  test("Debe actualizar la información de la empresa", async () => {
    const res = await request(app)
      .put("/api/users/onboarding/company-info")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Empresa Test",
        cif: "B12345678",
        address: "Calle Falsa 123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.companyInfo.name).toBe("Empresa Test");
  });

  test("Debe devolver el perfil del usuario", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.personalInfo.name).toBe("Test");
    expect(res.body.user.companyInfo.name).toBe("Empresa Test");
  });
});

describe("Invitación de usuarios", () => {
  let inviteToken;

  test("Debe invitar a otro usuario", async () => {
    const res = await request(app)
      .post("/api/users/invite")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "invitado@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.inviteToken).toBeDefined();
    inviteToken = res.body.inviteToken;
  });

  test("Debe registrar un usuario invitado", async () => {
    const res = await request(app)
      .post("/api/users/register-invited")
      .send({ token: inviteToken, password: "Password1234" });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("invitado@example.com");
    expect(res.body.user.role).toBe("guest");
  });
});

describe("Recuperación de contraseña", () => {
  let resetCode;

  test("Debe solicitar código de recuperación", async () => {
    const res = await request(app)
      .post("/api/users/request-password-reset")
      .send({ email: testUser.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.resetCode).toBeDefined();
    resetCode = res.body.resetCode;
  });

  test("Debe cambiar la contraseña correctamente", async () => {
    const res = await request(app)
      .post("/api/users/reset-password")
      .send({
        email: testUser.email,
        code: resetCode,
        password: "NuevaPassword123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Contraseña restablecida correctamente");
  });

  test("Debe hacer login con la nueva contraseña", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: testUser.email,
        password: "NuevaPassword123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

