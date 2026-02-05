import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
