import { useLocalSearchParams } from "expo-router";
import React from "react";
import { QuestDetailScreen } from "@/src/ui/organisms/QuestDetailScreen";

export default function QuestDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <QuestDetailScreen questId={id!} />;
}
