<script lang="ts">
    import Item from './Item.svelte'
    import type { LinkedItem, SupabaseList } from "./types";
    import { supabase } from "./stores";

    export let list: SupabaseList;

    async function updateItems() {
        const { error } = await supabase
            .from("lists")
            .update({
                items: list.items,
            })
            .eq("id", list.id);
        if(error) {
            console.log(`Error when updating list: ${error}`);
        }
    }

    const linkedItems: Map<number, LinkedItem> = new Map();
    let lastId = -1;
    for(let i = 0; i < list.items.length; i++) {
        linkedItems.set(list.items[i].id, {
            previousId: list.items[i - 1] === undefined ? -1 : list.items[i - 1].id,
            nextId: list.items[i + 1] === undefined ? -1 : list.items[i + 1].id,
        });
        if(list.items[i].id > lastId) {
            lastId = list.items[i].id;
        }
    }

    let focusedId = -1;
    if(list.items.length == 1) {
        focusedId = list.items[0].id;
    }

    // Inserts item after id
    function addItem(id: number) {
        let index = -1;
        if(id === list.items[list.items.length - 1]) {
            index = list.items.length - 1;
        } else {
            for(let i = 0; i < list.items.length; i++) {
                if(list.items[i].id === id) {
                    index = i;
                    break;
                }
            }
        }

        focusedId = ++lastId;
        list.items.splice(index + 1, 0, {
            id: lastId,
            content: "",
            checked: false,
        });
        list.items = list.items;
        updateItems();
        const oldNextId = linkedItems.get(id).nextId;
        if(oldNextId !== -1) {
            linkedItems.get(oldNextId).previousId = lastId;
        }
        linkedItems.get(id).nextId = lastId;

        linkedItems.set(lastId, {
            previousId: id,
            nextId: oldNextId,
        });
    }
    function deleteItem(id: number) {
        const { previousId, nextId } = linkedItems.get(id);
        if(previousId !== -1) {
            linkedItems.get(previousId).nextId = nextId;
        }
        if(nextId !== -1) {
            linkedItems.get(nextId).previousId = previousId;
        }
        for(let i = 0; i < list.items.length; i++) {
            if(list.items[i].id === id) {
                list.items.splice(i, 1);
                list.items = list.items;
                updateItems();
                return;
            }
        }
    }
    function previousItem(id: number) {
        focusedId = linkedItems.get(id).previousId;
    }
    function nextItem(id: number) {
        focusedId = linkedItems.get(id).nextId;
    }

    function onEnter(id: number) {
        addItem(id);
        nextItem(id);
    }
    function onBackspace(id: number) {
        if(list.items.length !== 1) {
            if(linkedItems.get(id).previousId === -1) {
                nextItem(id);
            } else {
                previousItem(id);
            }
            deleteItem(id);
        }
    }
    function goBack(id: number) {
        if(linkedItems.get(id).previousId !== -1) {
            previousItem(id);
        }
    }
    function goForward(id: number) {
        if(linkedItems.get(id).nextId !== -1) {
            nextItem(id);
        }
    }
</script>

<main>
    <div class="items">
        {#each list.items as item (item.id)}
            <Item bind:content={item.content}
                  bind:checked={item.checked}
                  focused={item.id === focusedId}
                  onEnter={() => onEnter(item.id)}
                  onBackspace={() => onBackspace(item.id)}
                  goBack={() => goBack(item.id)}
                  goForward={() => goForward(item.id)}
                  placeholder={list.items.length === 1 ? "Start typing your to-do..." : ""}
            />
        {/each}
    </div>
</main>

<style>
    div.items {
        margin: 2em auto;
        padding: 0 0.6em;
        max-width: 600px;
        width: 100%;
        box-sizing: border-box;
    }
    main {
        width: 100%;
    }
</style>
