export default function CertificateLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6">
      <div className="mb-5 h-[34px] w-[150px] animate-pulse rounded-full bg-muted-foreground/15" />
      <div
        className="relative w-full max-w-[980px] overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,0,0,.18)]"
        style={{ aspectRatio: "1920 / 1362" }}
      >
        <div className="absolute inset-y-0 right-0 w-[34%] bg-[#f9f8f6]" />
        <div className="absolute inset-y-0 left-0 flex w-[66%] animate-pulse flex-col gap-[3%] p-[5%]">
          <div className="h-[4%] w-[35%] rounded bg-neutral-200" />
          <div className="mt-[3%] h-[2.5%] w-[30%] rounded bg-neutral-200" />
          <div className="h-[6%] w-[60%] rounded bg-neutral-200" />
          <div className="mt-[3%] h-[2.5%] w-[45%] rounded bg-neutral-200" />
          <div className="h-[7%] w-[55%] rounded bg-neutral-200" />
          <div className="h-[2.5%] w-[80%] rounded bg-neutral-100" />
          <div className="h-[2.5%] w-[70%] rounded bg-neutral-100" />
          <div className="flex-1" />
          <div className="flex items-end justify-between">
            <div className="h-[40px] w-[25%] rounded bg-neutral-200" />
            <div className="aspect-square w-[12%] rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
