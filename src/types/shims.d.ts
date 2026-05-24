// Local shims to quiet type errors in the editor environment
declare module "framer-motion";
declare module "lucide-react";
declare module "next/navigation";
declare module "@eazo/sdk/react";
declare module "@eazo/sdk";
declare module "react/jsx-runtime";
declare module "react";
declare module "react-dom";
declare module "next/server";
declare module "drizzle-orm";

// Allow any JSX intrinsic elements to avoid editor-only errors when types can't be resolved
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
