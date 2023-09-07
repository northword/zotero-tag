import { TagEventTypes } from "../utils/rules";
import { recordTabStatus } from "./tabs";

export { initNotifierObserver };

function initNotifierObserver() {
  const callback = {
    notify: async (
      event: string,
      type: string,
      ids: number[] | string[],
      extraData: { [key: string]: any },
    ) => {
      if (!addon?.data.alive) {
        Zotero.Notifier.unregisterObserver(notifierID);
        return;
      }
      onNotify(event, type, ids, extraData);
    },
  };

  // Register the callback in Zotero as an item observer
  const notifierID = Zotero.Notifier.registerObserver(callback, [
    "tab",
    "item",
    "file",
  ]);
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: any },
) {
  // You can add your code to the corresponding notify type
  ztoolkit.log("notify", event, type, ids, extraData);
  if (event === "open" && type === "file") {
    const parentItems = Zotero.Items.getTopLevel(
      Zotero.Items.get(ids as number[]),
    );
    for (const item of parentItems) {
      await addon.api.dispatchRuleEvents(TagEventTypes.openFile, {
        itemID: item.id,
      });
    }
    return;
  }
  if (event === "add" && type === "item") {
    const items = Zotero.Items.get(ids as number[]);
    for (const item of items) {
      if (item.isRegularItem()) {
        await addon.api.dispatchRuleEvents(TagEventTypes.createItem, {
          itemID: item.id,
        });
      } else if (item.isAnnotation()) {
        await addon.api.dispatchRuleEvents(TagEventTypes.createAnnotation, {
          itemID: item.id,
        });
        const parentItem = Zotero.Items.getTopLevel([item])[0];
        await addon.api.dispatchRuleEvents(TagEventTypes.appendAnnotation, {
          itemID: parentItem.id,
        });
      } else if (item.isNote()) {
        await addon.api.dispatchRuleEvents(TagEventTypes.createNote, {
          itemID: item.id,
        });
        const parentItem = Zotero.Items.getTopLevel([item])[0];
        await addon.api.dispatchRuleEvents(TagEventTypes.appendNote, {
          itemID: parentItem.id,
        });
      }
    }
    return;
  }
  if (event === "add" && type === "tab") {
    recordTabStatus();
    return;
  }
  if (event == "close" && type == "tab") {
    const itemIDs = ids
      .map((id) => addon.data.tabStatus.get(id as string))
      .filter((id) => id);
    const parentItems = Zotero.Items.getTopLevel(
      Zotero.Items.get(itemIDs as number[]),
    );
    for (const item of parentItems) {
      await addon.api.dispatchRuleEvents(TagEventTypes.closeTab, {
        itemID: item.id,
      });
    }
  } else {
    return;
  }
}