import { MessagePage } from "@/components/layout";
import { ButtonLink } from "@/components/primitives";

export default function NotFound() {
  return (
    <MessagePage
      showEmblem
      title="That page has been packed away."
      body="The link may be old, or the page may have moved. The scent library and the booking form are both still where you left them."
    >
      <ButtonLink href="/">Back to home</ButtonLink>
      <ButtonLink href="/scents">The Scents</ButtonLink>
    </MessagePage>
  );
}
