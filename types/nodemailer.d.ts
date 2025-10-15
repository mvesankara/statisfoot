declare module "nodemailer" {
  type SMTPOptions = {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };

  type SentMessageInfo = {
    messageId?: string | null;
    [key: string]: unknown;
  };

  type Transporter = {
    sendMail: (options: unknown) => Promise<SentMessageInfo>;
  };

  type TestAccount = {
    user: string;
    pass: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
    };
  };

  const nodemailer: {
    createTransport: (options: SMTPOptions) => Transporter;
    createTestAccount: () => Promise<TestAccount>;
    getTestMessageUrl: (info: SentMessageInfo) => string | false;
  };

  export type { SMTPOptions, SentMessageInfo, TestAccount, Transporter };
  export default nodemailer;
}
