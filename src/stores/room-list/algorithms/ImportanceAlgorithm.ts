/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Algorithm, ITagMap, ITagSortingMap } from "./Algorithm";
import { Room } from "matrix-js-sdk/src/models/room";
import { isNullOrUndefined } from "matrix-js-sdk/src/utils";
import { DefaultTagID, TagID } from "../models";
import { splitRoomsByMembership } from "../membership";

/**
 * The determined category of a room.
 */
export enum Category {
    /**
     * The room has unread mentions within.
     */
    Red = "RED",
    /**
     * The room has unread notifications within. Note that these are not unread
     * mentions - they are simply messages which the user has asked to cause a
     * badge count update or push notification.
     */
    Grey = "GREY",
    /**
     * The room has unread messages within (grey without the badge).
     */
    Bold = "BOLD",
    /**
     * The room has no relevant unread messages within.
     */
    Idle = "IDLE",
}

/**
 * An implementation of the "importance" algorithm for room list sorting. Where
 * the tag sorting algorithm does not interfere, rooms will be ordered into
 * categories of varying importance to the user. Alphabetical sorting does not
 * interfere with this algorithm, however manual ordering does.
 *
 * The importance of a room is defined by the kind of notifications, if any, are
 * present on the room. These are classified internally as Red, Grey, Bold, and
 * Idle. Red rooms have mentions, grey have unread messages, bold is a less noisy
 * version of grey, and idle means all activity has been seen by the user.
 *
 * The algorithm works by monitoring all room changes, including new messages in
 * tracked rooms, to determine if it needs a new category or different placement
 * within the same category. For more information, see the comments contained
 * within the class.
 */
export class ImportanceAlgorithm extends Algorithm {

    // HOW THIS WORKS
    // --------------
    //
    // This block of comments assumes you've read the README one level higher.
    // You should do that if you haven't already.
    //
    // Tags are fed into the algorithmic functions from the Algorithm superclass,
    // which cause subsequent updates to the room list itself. Categories within
    // those tags are tracked as index numbers within the array (zero = top), with
    // each sticky room being tracked separately. Internally, the category index
    // can be found from `this.indices[tag][category]` and the sticky room information
    // from `this.stickyRooms[tag]`.
    //
    // Room categories are constantly re-evaluated and tracked in the `this.categorized`
    // object. Note that this doesn't track rooms by category but instead by room ID.
    // The theory is that by knowing the previous position, new desired position, and
    // category indices we can avoid tracking multiple complicated maps in memory.
    //
    // The room list store is always provided with the `this.cached` results, which are
    // updated as needed and not recalculated often. For example, when a room needs to
    // move within a tag, the array in `this.cached` will be spliced instead of iterated.

    private indices: {
        // @ts-ignore - TS wants this to be a string but we know better than it
        [tag: TagID]: {
            // @ts-ignore - TS wants this to be a string but we know better than it
            [category: Category]: number; // integer
        };
    } = {};
    private stickyRooms: {
        // @ts-ignore - TS wants this to be a string but we know better than it
        [tag: TagID]: {
            room?: Room;
            nAbove: number; // integer
        };
    } = {};
    private categorized: {
        // @ts-ignore - TS wants this to be a string but we know better than it
        [tag: TagID]: {
            // TODO: Remove note
            // Note: Should in theory be able to only track this by room ID as we'll know
            // the indices of each category and can determine if a category needs changing
            // in the cached list. Could potentially save a bunch of time if we can figure
            // out where a room is supposed to be using offsets, some math, and leaving the
            // array generally alone.
            [roomId: string]: {
                room: Room;
                category: Category;
            };
        };
    } = {};

    constructor() {
        super();
        console.log("Constructed an ImportanceAlgorithm");
    }

    protected async generateFreshTags(updatedTagMap: ITagMap): Promise<any> {
        return Promise.resolve();
    }

    protected async regenerateTag(tagId: string | DefaultTagID, rooms: []): Promise<[]> {
        return Promise.resolve(rooms);
    }

    public async handleRoomUpdate(room): Promise<boolean> {
        return Promise.resolve(false);
    }
}
