import HomeClient from "./components/HomeClient";
import { getSlides } from "@/lib/slides";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { desktop, mobile } = await getSlides();
  return <HomeClient desktopSlides={desktop} mobileSlides={mobile} />;
}
