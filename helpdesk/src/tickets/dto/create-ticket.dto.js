"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketDto = void 0;
var class_validator_1 = require("class-validator");
var CreateTicketDto = function () {
    var _a;
    var _subject_decorators;
    var _subject_initializers = [];
    var _subject_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _priority_decorators;
    var _priority_initializers = [];
    var _priority_extraInitializers = [];
    var _applicationId_decorators;
    var _applicationId_initializers = [];
    var _applicationId_extraInitializers = [];
    var _clientId_decorators;
    var _clientId_initializers = [];
    var _clientId_extraInitializers = [];
    var _issueTypeId_decorators;
    var _issueTypeId_initializers = [];
    var _issueTypeId_extraInitializers = [];
    var _assignedTo_decorators;
    var _assignedTo_initializers = [];
    var _assignedTo_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateTicketDto() {
                this.subject = __runInitializers(this, _subject_initializers, void 0);
                this.status = (__runInitializers(this, _subject_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.priority = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _priority_initializers, void 0));
                this.applicationId = (__runInitializers(this, _priority_extraInitializers), __runInitializers(this, _applicationId_initializers, void 0));
                this.clientId = (__runInitializers(this, _applicationId_extraInitializers), __runInitializers(this, _clientId_initializers, void 0));
                this.issueTypeId = (__runInitializers(this, _clientId_extraInitializers), __runInitializers(this, _issueTypeId_initializers, void 0));
                this.assignedTo = (__runInitializers(this, _issueTypeId_extraInitializers), __runInitializers(this, _assignedTo_initializers, void 0));
                __runInitializers(this, _assignedTo_extraInitializers);
            }
            return CreateTicketDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _subject_decorators = [(0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsString)()];
            _priority_decorators = [(0, class_validator_1.IsString)()];
            _applicationId_decorators = [(0, class_validator_1.IsInt)()];
            _clientId_decorators = [(0, class_validator_1.IsInt)()];
            _issueTypeId_decorators = [(0, class_validator_1.IsInt)()];
            _assignedTo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)()];
            __esDecorate(null, null, _subject_decorators, { kind: "field", name: "subject", static: false, private: false, access: { has: function (obj) { return "subject" in obj; }, get: function (obj) { return obj.subject; }, set: function (obj, value) { obj.subject = value; } }, metadata: _metadata }, _subject_initializers, _subject_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: function (obj) { return "priority" in obj; }, get: function (obj) { return obj.priority; }, set: function (obj, value) { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
            __esDecorate(null, null, _applicationId_decorators, { kind: "field", name: "applicationId", static: false, private: false, access: { has: function (obj) { return "applicationId" in obj; }, get: function (obj) { return obj.applicationId; }, set: function (obj, value) { obj.applicationId = value; } }, metadata: _metadata }, _applicationId_initializers, _applicationId_extraInitializers);
            __esDecorate(null, null, _clientId_decorators, { kind: "field", name: "clientId", static: false, private: false, access: { has: function (obj) { return "clientId" in obj; }, get: function (obj) { return obj.clientId; }, set: function (obj, value) { obj.clientId = value; } }, metadata: _metadata }, _clientId_initializers, _clientId_extraInitializers);
            __esDecorate(null, null, _issueTypeId_decorators, { kind: "field", name: "issueTypeId", static: false, private: false, access: { has: function (obj) { return "issueTypeId" in obj; }, get: function (obj) { return obj.issueTypeId; }, set: function (obj, value) { obj.issueTypeId = value; } }, metadata: _metadata }, _issueTypeId_initializers, _issueTypeId_extraInitializers);
            __esDecorate(null, null, _assignedTo_decorators, { kind: "field", name: "assignedTo", static: false, private: false, access: { has: function (obj) { return "assignedTo" in obj; }, get: function (obj) { return obj.assignedTo; }, set: function (obj, value) { obj.assignedTo = value; } }, metadata: _metadata }, _assignedTo_initializers, _assignedTo_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTicketDto = CreateTicketDto;
// export class CreateTicketDto {
//   subject: string;
//   status: string;
//   priority: string;
//   applicationId: number;
//   clientId: number;
//   issueTypeId: number;
// }
