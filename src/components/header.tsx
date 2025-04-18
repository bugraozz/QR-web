import { ColourfulText } from "@/components/ui/colourful-text";
import React from "react";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";

export function Header() {
    return (
      <header className="relative py-8 text-center flex justify-center items-center w-full bg-white">
        <div className="container px-4">
          <BackgroundBeamsWithCollision>
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-white relative z-2 font-sans">
              <ColourfulText text="Lezzet Dünyası"/>
            </h1>
          </BackgroundBeamsWithCollision>
        </div>
      </header>
    )
}

