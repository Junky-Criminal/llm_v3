import React, { useState } from "react";
import { useTaskContext, TagType } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import TagBadge from "./TagBadge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TagManagerProps {
  selectedTag: TagType;
  onTagSelect: (tag: TagType) => void;
}

const TagManager = ({ selectedTag, onTagSelect }: TagManagerProps) => {
  const { availableTags, addCustomTag, removeTag } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    const normalizedTag = newTag.toLowerCase().trim() as TagType;

    if (availableTags.includes(normalizedTag)) {
      toast.info("This tag already exists");
      setNewTag("");
      return;
    }

    await addCustomTag(normalizedTag);
    toast.success(`Tag "${normalizedTag}" added`);
    setNewTag("");
  };

  const handleDeleteTag = async (tag: TagType) => {
    if (tag === "other") {
      toast.error("Cannot delete the default 'other' tag");
      return;
    }

    await removeTag(tag);
    toast.success(`Tag "${tag}" deleted`);

    if (selectedTag === tag) {
      onTagSelect("other");
    }
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTag
              ? availableTags.find((tag) => tag === selectedTag)
              : "Select tag..."}
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                onTagSelect("other");
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <Input
              placeholder="Type new tag..."
              className="h-9 uppercase"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value.toUpperCase())}
            />
            <CommandEmpty>No tag found.</CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={() => {
                    onTagSelect(tag);
                    setOpen(false);
                  }}
                  className="flex justify-between"
                >
                  <div className="flex items-center">
                    <TagBadge tag={tag} />
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedTag === tag ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  {tag !== "other" && (
                    <Trash2
                      className="h-4 w-4 text-destructive cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag);
                      }}
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
          <div className="p-2 flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag name"
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagManager;