import React from "react";
import { Redirect } from "expo-router";

// This tab slot is for the write button — redirect to the write modal
export default function WriteTabScreen() {
  return <Redirect href="/write" />;
}
