import React, { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../mask.module.scss";
import { Mask, useMaskStore } from "../../store/mask";
import { useChatStore } from "../../store";
import { Select, showConfirm } from "../ui-lib";
import { IconButton } from "../button";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../../locales";
import { Path, FileName } from "../../constant";
import { downloadAs, readFromFile } from "../../utils";

import AddIcon from "../../icons/add.svg";
import EditIcon from "../../icons/edit.svg";
import DeleteIcon from "../../icons/delete.svg";
import EyeIcon from "../../icons/eye.svg";
import CopyIcon from "../../icons/copy.svg";

import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";
import { MaskAvatar } from "../mask";
import clsx from "clsx";

// Global context for mask editing - allows MasksListWrapper to signal parent
const MaskEditContext = createContext<
  { onEditMask?: (maskId: string) => void } | undefined
>(undefined);

export const useMaskEditContext = () => {
  return useContext(MaskEditContext);
};

export const MaskEditProvider = ({
  children,
  onEditMask,
}: {
  children: React.ReactNode;
  onEditMask?: (maskId: string) => void;
}) => {
  return (
    <MaskEditContext.Provider value={{ onEditMask }}>
      {children}
    </MaskEditContext.Provider>
  );
};

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export interface MasksListWrapperProps {
  onEditMask?: (maskId: string) => void;
}

/**
 * Wrapper component for the Masks list section
 * Handles search, filtering, drag-and-drop, and mask item rendering
 * This bridges the PageConfig system with the existing mask functionality
 */
export function MasksListWrapper({
  onEditMask: propsOnEditMask,
}: MasksListWrapperProps) {
  const navigate = useNavigate();
  const maskStore = useMaskStore();
  const chatStore = useChatStore();

  // Try to get onEditMask from context first (parent provider), then props
  const contextOnEditMask = useMaskEditContext()?.onEditMask;
  const onEditMask = propsOnEditMask || contextOnEditMask;

  const filterLang = maskStore.language;

  const allMasks = maskStore
    .getAll()
    .filter((m) => !filterLang || m.lang === filterLang);

  const [searchMasks, setSearchMasks] = useState<Mask[]>([]);
  const [searchText, setSearchText] = useState("");
  const masks = searchText.length > 0 ? searchMasks : allMasks;

  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allMasks.filter((m) =>
        m.name.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchMasks(result);
    } else {
      setSearchMasks(allMasks);
    }
  };

  const downloadAll = () => {
    downloadAs(JSON.stringify(masks.filter((v) => !v.builtin)), FileName.Masks);
  };

  const importFromFile = () => {
    readFromFile().then((content) => {
      try {
        const importMasks = JSON.parse(content);
        if (Array.isArray(importMasks)) {
          for (const mask of importMasks) {
            if (mask.name) {
              maskStore.create(mask);
            }
          }
          return;
        }
        if (importMasks.name) {
          maskStore.create(importMasks);
        }
      } catch {}
    });
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceList =
      source.droppableId === "masks-list" ? masks : [maskStore.get("")];
    const destList =
      destination.droppableId === "masks-list" ? masks : [maskStore.get("")];
    const newSourceList = reorder(
      sourceList,
      source.index,
      destination.index === sourceList.length
        ? destination.index
        : destination.index,
    );

    if (source.droppableId === "masks-list") {
      maskStore.updateMasks(newSourceList);
    }
  };

  return (
    <div>
      <div className={styles["mask-filter"]}>
        <input
          type="text"
          className={styles["search-bar"]}
          placeholder={Locale.Mask.Page.Search}
          autoFocus
          onInput={(e) => onSearch(e.currentTarget.value)}
        />
        <Select
          className={styles["mask-filter-lang"]}
          value={filterLang ?? Locale.Settings.Lang.All}
          onChange={(e) => {
            const value = e.currentTarget.value;
            if (value === Locale.Settings.Lang.All) {
              maskStore.setLanguage(undefined);
            } else {
              maskStore.setLanguage(value as Lang);
            }
          }}
        >
          <option key="all" value={Locale.Settings.Lang.All}>
            {Locale.Settings.Lang.All}
          </option>
          {AllLangs.map((lang) => (
            <option value={lang} key={lang}>
              {ALL_LANG_OPTIONS[lang]}
            </option>
          ))}
        </Select>

        <IconButton
          className={styles["mask-create"]}
          icon={<AddIcon />}
          text={Locale.Mask.Page.Create}
          bordered
          onClick={() => {
            const createdMask = maskStore.create();
            onEditMask?.(createdMask.id);
          }}
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="masks-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {masks.map((m, index) => (
                <Draggable key={m.id} draggableId={m.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={styles["mask-item"]}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className={styles["mask-header"]}>
                        <div
                          className={styles["mask-icon"]}
                          {...provided.dragHandleProps}
                        >
                          <MaskAvatar
                            avatar={m.avatar}
                            model={m.modelConfig.model}
                          />
                        </div>
                        <div className={styles["mask-title"]}>
                          <div className={styles["mask-name"]}>{m.name}</div>
                          <div
                            className={clsx(styles["mask-info"], "one-line")}
                          >
                            {`${Locale.Mask.Item.Info(m.context.length)} / ${
                              ALL_LANG_OPTIONS[m.lang]
                            } / ${m.modelConfig.model}`}
                          </div>
                        </div>
                      </div>
                      <div className={styles["mask-actions"]}>
                        <IconButton
                          icon={<AddIcon />}
                          text={Locale.Mask.Item.Chat}
                          onClick={() => {
                            chatStore.newSession(m);
                            navigate(Path.Chat);
                          }}
                        />
                        {m.builtin ? (
                          <IconButton
                            icon={<EyeIcon />}
                            text={Locale.Mask.Item.View}
                            onClick={() => onEditMask?.(m.id)}
                          />
                        ) : (
                          <IconButton
                            icon={<EditIcon />}
                            text={Locale.Mask.Item.Edit}
                            onClick={() => onEditMask?.(m.id)}
                          />
                        )}
                        {m.builtin ? null : (
                          <IconButton
                            icon={<CopyIcon />}
                            text={Locale.Mask.Item.Clone}
                            onClick={() => {
                              const mask = maskStore.get(m.id);
                              if (mask) {
                                maskStore.create(mask);
                              }
                            }}
                          />
                        )}
                        {m.builtin ? null : (
                          <IconButton
                            icon={<DeleteIcon />}
                            text={Locale.Mask.Item.Delete}
                            onClick={async () => {
                              if (
                                await showConfirm(
                                  Locale.Mask.Item.DeleteConfirm,
                                )
                              ) {
                                maskStore.delete(m.id);
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
