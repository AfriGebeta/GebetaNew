"use client"

export default function MaintenanceError() {
    return (
        <div className='h-svh'>
            <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                <span className='font-medium'>API usage is under maintenance!</span>
                <p className='text-center text-muted-foreground'>
                    The usage is not available at the moment. <br />
                    We'll be back shortly.
                </p>
            </div>
        </div>
    )
}