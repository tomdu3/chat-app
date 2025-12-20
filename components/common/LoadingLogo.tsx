import React from "react";
import Image from "next/image";

type Props = {
    size?: number;
}

export function LoadingLogo({ size = 100 }: Props) {
    return (
        <div className="h-full w-full flex justify-center items-center">
            <Image src="/imgs/logo.svg" className="animate-spin duration-600" width={size} height={size} alt="Logo" />
        </div>
    )
}