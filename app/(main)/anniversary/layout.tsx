
import { AppLayout } from "@/components/layout/app-layout";
import type { ReactNode } from "react";

export default function Layout(props: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {props.children}
      {props.modal}
    </>
  );
}