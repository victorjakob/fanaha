import CreateAlchemyArtPieceForm from "./CreateAlchemyArtPieceForm";

export default async function CreateAlchemyArtPiecePage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen pt-23 py-12 px-4 sm:px-8">
      <section className="w-full max-w-2xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Add New Art Piece
        </h1>
      </section>
      <CreateAlchemyArtPieceForm />
    </main>
  );
}
