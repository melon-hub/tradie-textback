export default async function (req: Request) {
  return new Response(JSON.stringify({ message: "reset-test-data function reached" }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
