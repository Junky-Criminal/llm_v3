
import React from "react";
import { cn } from "@/lib/utils";
import { TagType, getTagStyles } from "@/context/TaskContext";

interface TagBadgeProps {
  tag: TagType;
  className?: string;
}

const TagBadge = ({ tag, className }: TagBadgeProps) => {
  const baseStyles = "px-2.5 py-0.5 rounded-full text-xs font-medium";
  const tagStyle = getTagStyles(tag);
  
  return (
    <span className={cn(baseStyles, tagStyle, className)}>
      {tag.charAt(0).toUpperCase() + tag.slice(1)}
    </span>
  );
};

export default TagBadge;
