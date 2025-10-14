import { redirect } from "next/navigation";

export default async function ManagePage() {
  // Redirect to the alchemical art pieces section by default
  redirect("/manage/alchemical-art-pieces");
}
