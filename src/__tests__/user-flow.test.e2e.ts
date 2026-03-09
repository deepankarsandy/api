import { describe, expect, test } from "bun:test";
import { buildApp } from "@/app";

const app = buildApp();
const testEmail = `johndoe+${Date.now()}@example.com`;

describe("User Flow E2E", () => {
  test("should sign up a new user", async () => {
    const user = {
      email: testEmail,
      password: "securePassword123",
      name: "John Doe",
    };

    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }),
    );

    expect(res.status).toBe(200);
  });

  test("should get a user by email", async () => {
    const res = await app.handle(new Request(`http://localhost/api/v1/users/${testEmail}`));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.email).toBe(testEmail);
  });

  test("should return standardized error format on validation error", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email",
          password: "short",
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
