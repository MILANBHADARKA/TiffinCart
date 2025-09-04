import VerifyEmailPage from "./VerifyEmailPage";

export default function Page({ searchParams }) {
  return <VerifyEmailPage email={searchParams.email} />;
}
