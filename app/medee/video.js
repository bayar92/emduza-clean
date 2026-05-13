import React, { useState } from "react";
import TopNavBar from "../../../emduza/components/TopNavBar";
import FooterNavBar from "../../../emduza/components/FooterNavBar";
import Head from "next/head";
import { PrismaClient } from "@prisma/client";
import VideoNews from "@/components/VideoNews";

const prisma = new PrismaClient();

const VideoPage = () => {
  return (
    <div>
      <Head>
        <title>Видео мэдээ</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <TopNavBar />
      <div className="container mx-auto mt-20 flex mb-20">
        <VideoNews />
      </div>
      <FooterNavBar />
    </div>
  );
};

export default VideoPage;
