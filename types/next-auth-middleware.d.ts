declare module "next-auth/middleware" {
  export type WithAuthConfig = {
    callbacks: {
      authorized: (params: {
        token?: { role?: unknown } | null;
        req: { nextUrl: { pathname: string } };
      }) => boolean;
    };
  };

  export function withAuth(config: WithAuthConfig): unknown;
}
