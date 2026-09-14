import { ActionRow, MessagePage } from "@/components/layout";
import { ButtonLink } from "@/components/primitives";

export default function NotFound() {
  return (
    <MessagePage
      heading="That page has been packed away."
      body="The link may be old, or the page may have moved. The scent library and the booking form are both still where you left them."
    >
      <ActionRow>
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/scents">The Scents</ButtonLink>
      </ActionRow>
    </MessagePage>
  );
}
