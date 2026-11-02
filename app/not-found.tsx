import { PageHeader, TextLink } from "@/components/page-parts";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found">That page doesn&apos;t exist, or it isn&apos;t in your workspace.</PageHeader>
      <TextLink href="/">Back to dashboard</TextLink>
    </>
  );
}
