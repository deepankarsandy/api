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
    expect(data.email).toBe(email);
  });
});
