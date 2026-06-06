import { beforeAll, afterAll, describe, test, expect } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;
let app;
let token;
let tripId;

const userPayload = {
  email: "tester@example.com",
  password: "password123",
  name: "Test User",
};

const tripPayload = {
  title: "Tokyo Test Trip",
  where: "Tokyo, Japan",
  dateLabel: "Jul 12 – Jul 19",
  whoLabel: "2 travelers",
  budgetLabel: "$1500",
  days: [
    {
      day: "Day 1",
      date: "Sat, Jul 12",
      theme: "Arrival",
      stops: [
        {
          time: "9:00",
          title: "Airport",
          type: "Travel",
          description: "Land at Narita",
          duration: "1 hr",
          cost: "$0",
        },
      ],
    },
  ],
  budget: { total: "$1500", dayOneTotal: "$0", remaining: "$1500" },
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = "test-jwt-secret";
  await mongoose.connect(mongo.getUri());

  const mod = await import("../app.js");
  app = mod.default;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Full CRUD + auth flow", () => {
  test("1. POST /api/auth/register creates a user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(userPayload.email);
    expect(res.body.user.name).toBe(userPayload.name);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test("2. POST /api/auth/login returns a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userPayload.email,
      password: userPayload.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  test("3. POST /api/trips creates a trip (with auth)", async () => {
    const res = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${token}`)
      .send(tripPayload);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(tripPayload.title);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("userId");
    tripId = res.body._id;
  });

  test("4. GET /api/trips returns the user's trips", async () => {
    const res = await request(app)
      .get("/api/trips")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]._id).toBe(tripId);
  });

  test("5. GET /api/trips/:id returns the single trip", async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(tripId);
    expect(res.body.title).toBe(tripPayload.title);
  });

  test("6. PUT /api/trips/:id updates the trip", async () => {
    const res = await request(app)
      .put(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Tokyo Trip" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Tokyo Trip");
    expect(res.body._id).toBe(tripId);
  });

  test("7. DELETE /api/trips/:id removes the trip", async () => {
    const res = await request(app)
      .delete(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("8. GET /api/trips/:id after delete returns 404", async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("Error cases", () => {
  test("register with duplicate email returns 409", async () => {
    const res = await request(app).post("/api/auth/register").send(userPayload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  test("login with wrong password returns 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userPayload.email,
      password: "wrong-password",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  test("GET /api/trips without token returns 401", async () => {
    const res = await request(app).get("/api/trips");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/token/i);
  });
});
