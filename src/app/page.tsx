"use client";
import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NavbarDemo } from "@/components/navbar";
import CategoryCard3D from "@/components/category-card";
import {Header} from "@/components/header";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function Home() {
  return (
    <div >
      <Header/>
     
      <CategoryCard3D />
      
      
    </div>  
  );
}
