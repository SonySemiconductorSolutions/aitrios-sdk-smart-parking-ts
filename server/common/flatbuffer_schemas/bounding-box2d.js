"use strict";
/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundingBox2d = void 0;
var flatbuffers = require("flatbuffers");
var BoundingBox2d = /** @class */ (function () {
    function BoundingBox2d() {
        this.bb = null;
        this.bb_pos = 0;
    }
    BoundingBox2d.prototype.__init = function (i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    };
    BoundingBox2d.getRootAsBoundingBox2d = function (bb, obj) {
        return (obj || new BoundingBox2d()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    BoundingBox2d.getSizePrefixedRootAsBoundingBox2d = function (bb, obj) {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new BoundingBox2d()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    };
    BoundingBox2d.prototype.left = function () {
        var offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    BoundingBox2d.prototype.top = function () {
        var offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    BoundingBox2d.prototype.right = function () {
        var offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    BoundingBox2d.prototype.bottom = function () {
        var offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
    };
    BoundingBox2d.startBoundingBox2d = function (builder) {
        builder.startObject(4);
    };
    BoundingBox2d.addLeft = function (builder, left) {
        builder.addFieldInt32(0, left, 0);
    };
    BoundingBox2d.addTop = function (builder, top) {
        builder.addFieldInt32(1, top, 0);
    };
    BoundingBox2d.addRight = function (builder, right) {
        builder.addFieldInt32(2, right, 0);
    };
    BoundingBox2d.addBottom = function (builder, bottom) {
        builder.addFieldInt32(3, bottom, 0);
    };
    BoundingBox2d.endBoundingBox2d = function (builder) {
        var offset = builder.endObject();
        return offset;
    };
    BoundingBox2d.createBoundingBox2d = function (builder, left, top, right, bottom) {
        BoundingBox2d.startBoundingBox2d(builder);
        BoundingBox2d.addLeft(builder, left);
        BoundingBox2d.addTop(builder, top);
        BoundingBox2d.addRight(builder, right);
        BoundingBox2d.addBottom(builder, bottom);
        return BoundingBox2d.endBoundingBox2d(builder);
    };
    return BoundingBox2d;
}());
exports.BoundingBox2d = BoundingBox2d;
