import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostcodeInput from "./PostcodeInput";
export default function LocationTabs() {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="w-full bg-background">
        <TabsTrigger value="postcode" className="data-active:text-primary dark:data-active:text-primary hover:text-current font-normal py-2 cursor-pointer">
          Postcode
        </TabsTrigger>
        <TabsTrigger value="town-city" className="data-active:text-primary dark:data-active:text-primary hover:text-current font-normal py-2 cursor-pointer">
          Town/City
        </TabsTrigger>
      </TabsList>
      <TabsContent value="postcode" className="text-sans w-full">
        <PostcodeInput />
      </TabsContent>
      <TabsContent value="town-city" className="text-sans  w-full">
        Change your password here.
      </TabsContent>
    </Tabs>
  );
}
