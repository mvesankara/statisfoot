declare module "nodemailer" {
  const nodemailer: {
    createTransport: (options: unknown) => any;
    getTestMessageUrl: (info: unknown) => string | false;
  };
  export default nodemailer;
}
