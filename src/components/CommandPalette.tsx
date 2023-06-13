import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Command } from "cmdk";
import { Fragment, useCallback, useEffect, useState } from "react";
import { TauriEvent } from "@tauri-apps/api/event";
import { Transition } from "@headlessui/react";
import { appWindow } from "@tauri-apps/api/window";
import { getNotes } from "../lib/notes";
import { register } from "@tauri-apps/api/globalShortcut";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

export default function CommandPalette() {
  // Router state
  const navigate = useNavigate();

  // Server state
  const { data: notes } = useQuery(["notes"], getNotes);

  // Local state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Handlers
  const handleRegisterCommands = useCallback(() => {
    register("Command+P", () => {
      setIsOpen(($) => !$);
    }).catch(() => {});
  }, []);

  // Side-effects
  useEffect(() => {
    handleRegisterCommands();

    appWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
      handleRegisterCommands();
    });
  }, []);

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-100"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Command.Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        className="fixed top-1/2 left-1/2 w-full transform -translate-y-1/2 -translate-x-1/2 max-w-lg rounded-lg bg-black shadow-2xl shadow-gray-300 dark:shadow-gray-900 overflow-hidden h-[350px] flex flex-col"
      >
        <Command.Input
          placeholder="Open a document"
          className="text-lg p-3.5 w-full focus:outline-none bg-transparent placeholder-gray-600 text-white"
        />

        <Command.List className="flex-1 overflow-y-auto px-2.5 pb-2.5 overscroll-contain scroll-py-2.5">
          <Command.Group>
            {notes?.map((note) => (
              <Command.Item
                className="py-2 px-2.5 rounded flex items-center justify-between cursor-pointer"
                onSelect={() => {
                  navigate(`/notes/${note.name}`);
                  setIsOpen(false);
                }}
                key={note.name}
              >
                <span className="text-white">{note.name?.split(".md")[0]}</span>

                <ArrowRightIcon className="w-4 text-white note-arrow opacity-0" />
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </Transition>
  );
}
