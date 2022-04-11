export default {
  getTagByGroup: function (group) {
    if (typeof group === "undefined") {
      return prompt("Enter tags, split by ',':", "")
        .replace(/\s/g, "")
        .split(",");
    }
    let rules = Zotero.ZoteroTag.rules();
    let tags = [];
    for (let i = 0; i < rules.length; i++) {
      if (group === -1 || Number(rules[i].group) === group) {
        tags = tags.concat(rules[i].tags);
      }
    }
    return Zotero.ZoteroTag.removeDuplication(tags);
  },
  getTagsByEvent: function (event) {
    let rules = Zotero.ZoteroTag.rules();
    let tags = {
      add: [],
      remove: [],
      change: [],
    };
    for (let i = 0; i < rules.length; i++) {
      for (let j = 0; j < rules[i].actions.length; j++) {
        if (rules[i].actions[j].event == event) {
          let op = rules[i].actions[j].operation;
          tags[op] = tags[op].concat(rules[i].tags);
        }
      }
    }
    return tags;
  },
  removeDuplication: function (tags) {
    let tagSet = new Set(tags);
    let _tags = [];
    for (let item of tagSet) {
      _tags.push(item);
    }
    return _tags;
  },
};