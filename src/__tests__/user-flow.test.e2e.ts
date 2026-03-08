import { describe, expect, test } from "bun:test";
import { buildApp } from "@/app";

const app = buildApp();

describe("User Flow E2E", () => {
  test("should create a new user", async () => {
    const user = {
      name: "John Doe",
      email: "johndoe@example.com",
    };

    const res = await app.handle(
      new Request("http://localhost/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }),
    );

    expect(res.status).toBe(201);
  });

  test("should get a user by email", async () => {
    const email = "johndoe@example.com";
    const res = await app.handle(new Request(`http://localhost/api/v1/users/${email}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.email).toBe(email);
  });

  test("should return standardized error format on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: 123,
          email: "invalid-email",
        }),
      }),
    );
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("code", "VALIDATION");
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("status", 422);
  });
});
