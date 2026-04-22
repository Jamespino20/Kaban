"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var adapter_neon_1 = require("@prisma/adapter-neon");
var serverless_1 = require("@neondatabase/serverless");
var ws_1 = require("ws");
var auth_1 = require("@/lib/auth"); // For tenant context
var db_url_1 = require("@/lib/db-url");
var getAdapterMode = function () {
    var _a;
    var explicitMode = (_a = process.env.AGAPAY_PRISMA_ADAPTER) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (explicitMode === "http" || explicitMode === "ws") {
        return explicitMode;
    }
    // This app relies on transactions for its Prisma extension and tests,
    // so the websocket adapter is the safe default in local Node runtimes.
    return "ws";
};
var getPrisma = function () {
    if (globalThis.agapay_apex_prisma)
        return globalThis.agapay_apex_prisma;
    var rawUrl = (0, db_url_1.getDbUrl)();
    // Aggressive sanitization to eliminate hidden character corruption
    var connectionString = rawUrl
        ? rawUrl.replace(/["'\r\n\s]/g, "").trim()
        : "";
    try {
        serverless_1.neonConfig.webSocketConstructor = ws_1.default;
        console.log("📡 AGAPAY_PRISMA: Initializing Hybrid Adapter...");
        console.log("📡 AGAPAY_PRISMA: Connection String Status =", connectionString ? "PRESENT" : "MISSING");
        var adapterMode = getAdapterMode();
        var adapter = void 0;
        if (adapterMode === "ws") {
            console.log("📡 AGAPAY_PRISMA: Using PrismaNeon (WebSocket) adapter.");
            var pool = new serverless_1.Pool({ connectionString: connectionString });
            adapter = new adapter_neon_1.PrismaNeon(pool);
        }
        else {
            console.log("📡 AGAPAY_PRISMA: Using PrismaNeonHttp adapter (transactions disabled).");
            adapter = new adapter_neon_1.PrismaNeonHttp(connectionString, {
            // Default options for HTTP connection
            });
        }
        var baseClient_1 = new client_1.PrismaClient({
            adapter: adapter,
            log: ["query", "error", "warn"],
        });
        // Extension Layer (RLS & Audit)
        var extendedClient = baseClient_1.$extends({
            query: {
                $allModels: {
                    $allOperations: function (_a) {
                        return __awaiter(this, arguments, void 0, function (_b) {
                            var tenantId, userId, session, e_1, isRead;
                            var _this = this;
                            var model = _b.model, operation = _b.operation, args = _b.args, query = _b.query;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        tenantId = null;
                                        userId = null;
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, auth_1.auth)()];
                                    case 2:
                                        session = _c.sent();
                                        if (session === null || session === void 0 ? void 0 : session.user) {
                                            tenantId = session.user.tenantId
                                                ? parseInt(session.user.tenantId.toString())
                                                : null;
                                            userId = session.user.user_id
                                                ? parseInt(session.user.user_id.toString())
                                                : null;
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_1 = _c.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        isRead = operation.startsWith("find") || operation.startsWith("count");
                                        if (isRead && model !== "AuditLog" && (tenantId || userId)) {
                                            baseClient_1.auditLog
                                                .create({
                                                data: {
                                                    tenant_id: tenantId,
                                                    user_id: userId,
                                                    action: "READ_".concat(operation.toUpperCase()),
                                                    entity_type: model,
                                                    ip_address: "internal",
                                                    new_values: { args: args },
                                                },
                                            })
                                                .catch(function () { });
                                        }
                                        return [2 /*return*/, baseClient_1.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!tenantId) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, tx.$executeRawUnsafe("SET LOCAL app.tenant_id = ".concat(tenantId))];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2:
                                                            if (!userId) return [3 /*break*/, 4];
                                                            return [4 /*yield*/, tx.$executeRawUnsafe("SET LOCAL app.user_id = ".concat(userId))];
                                                        case 3:
                                                            _a.sent();
                                                            _a.label = 4;
                                                        case 4: return [2 /*return*/, query(args)];
                                                    }
                                                });
                                            }); })];
                                }
                            });
                        });
                    },
                },
            },
        });
        globalThis.agapay_apex_prisma = extendedClient;
        return extendedClient;
    }
    catch (error) {
        console.error("❌ AGAPAY: Prisma Singleton Critical Failure:", error);
        throw error;
    }
};
var prisma = getPrisma();
exports.default = prisma;
