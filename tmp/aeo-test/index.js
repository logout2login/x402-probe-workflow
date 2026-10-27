var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/abitype/dist/esm/version.js
var version;
var init_version = __esm({
  "node_modules/abitype/dist/esm/version.js"() {
    version = "1.2.3";
  }
});

// node_modules/abitype/dist/esm/errors.js
var BaseError;
var init_errors = __esm({
  "node_modules/abitype/dist/esm/errors.js"() {
    init_version();
    BaseError = class extends Error {
      constructor(shortMessage, args = {}) {
        const details = args.cause instanceof BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
        const docsPath8 = args.cause instanceof BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsPath8 ? [`Docs: https://abitype.dev${docsPath8}`] : [],
          ...details ? [`Details: ${details}`] : [],
          `Version: abitype@${version}`
        ].join("\n");
        super(message);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiTypeError"
        });
        if (args.cause)
          this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath8;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
      }
    };
    __name(BaseError, "BaseError");
  }
});

// node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
var bytesRegex, integerRegex, isTupleRegex;
var init_regex = __esm({
  "node_modules/abitype/dist/esm/regex.js"() {
    __name(execTyped, "execTyped");
    bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    isTupleRegex = /^\(.+?\).*?$/;
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i = 0; i < length; i++) {
      const component = abiParameter.components[i];
      type += formatAbiParameter(component);
      if (i < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array || ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
var tupleRegex;
var init_formatAbiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js"() {
    init_regex();
    tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
    __name(formatAbiParameter, "formatAbiParameter");
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i = 0; i < length; i++) {
    const abiParameter = abiParameters[i];
    params += formatAbiParameter(abiParameter);
    if (i !== length - 1)
      params += ", ";
  }
  return params;
}
var init_formatAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js"() {
    init_formatAbiParameter();
    __name(formatAbiParameters, "formatAbiParameters");
  }
});

// node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  return "receive() external payable";
}
var init_formatAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiItem.js"() {
    init_formatAbiParameters();
    __name(formatAbiItem, "formatAbiItem");
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
function isErrorSignature(signature) {
  return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
  return execTyped(errorSignatureRegex, signature);
}
function isEventSignature(signature) {
  return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
  return execTyped(eventSignatureRegex, signature);
}
function isFunctionSignature(signature) {
  return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
  return execTyped(functionSignatureRegex, signature);
}
function isStructSignature(signature) {
  return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
  return execTyped(structSignatureRegex, signature);
}
function isConstructorSignature(signature) {
  return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
  return execTyped(constructorSignatureRegex, signature);
}
function isFallbackSignature(signature) {
  return fallbackSignatureRegex.test(signature);
}
function execFallbackSignature(signature) {
  return execTyped(fallbackSignatureRegex, signature);
}
function isReceiveSignature(signature) {
  return receiveSignatureRegex.test(signature);
}
var errorSignatureRegex, eventSignatureRegex, functionSignatureRegex, structSignatureRegex, constructorSignatureRegex, fallbackSignatureRegex, receiveSignatureRegex, modifiers, eventModifiers, functionModifiers;
var init_signatures = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/signatures.js"() {
    init_regex();
    errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    __name(isErrorSignature, "isErrorSignature");
    __name(execErrorSignature, "execErrorSignature");
    eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    __name(isEventSignature, "isEventSignature");
    __name(execEventSignature, "execEventSignature");
    functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
    __name(isFunctionSignature, "isFunctionSignature");
    __name(execFunctionSignature, "execFunctionSignature");
    structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
    __name(isStructSignature, "isStructSignature");
    __name(execStructSignature, "execStructSignature");
    constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
    __name(isConstructorSignature, "isConstructorSignature");
    __name(execConstructorSignature, "execConstructorSignature");
    fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
    __name(isFallbackSignature, "isFallbackSignature");
    __name(execFallbackSignature, "execFallbackSignature");
    receiveSignatureRegex = /^receive\(\) external payable$/;
    __name(isReceiveSignature, "isReceiveSignature");
    modifiers = /* @__PURE__ */ new Set([
      "memory",
      "indexed",
      "storage",
      "calldata"
    ]);
    eventModifiers = /* @__PURE__ */ new Set(["indexed"]);
    functionModifiers = /* @__PURE__ */ new Set([
      "calldata",
      "memory",
      "storage"
    ]);
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
var InvalidAbiItemError, UnknownTypeError, UnknownSolidityTypeError;
var init_abiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiItem.js"() {
    init_errors();
    InvalidAbiItemError = class extends BaseError {
      constructor({ signature }) {
        super("Failed to parse ABI item.", {
          details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
          docsPath: "/api/human#parseabiitem-1"
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiItemError"
        });
      }
    };
    __name(InvalidAbiItemError, "InvalidAbiItemError");
    UnknownTypeError = class extends BaseError {
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [
            `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownTypeError"
        });
      }
    };
    __name(UnknownTypeError, "UnknownTypeError");
    UnknownSolidityTypeError = class extends BaseError {
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [`Type "${type}" is not a valid ABI type.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSolidityTypeError"
        });
      }
    };
    __name(UnknownSolidityTypeError, "UnknownSolidityTypeError");
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
var InvalidAbiParametersError, InvalidParameterError, SolidityProtectedKeywordError, InvalidModifierError, InvalidFunctionModifierError, InvalidAbiTypeParameterError;
var init_abiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js"() {
    init_errors();
    InvalidAbiParametersError = class extends BaseError {
      constructor({ params }) {
        super("Failed to parse ABI parameters.", {
          details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
          docsPath: "/api/human#parseabiparameters-1"
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiParametersError"
        });
      }
    };
    __name(InvalidAbiParametersError, "InvalidAbiParametersError");
    InvalidParameterError = class extends BaseError {
      constructor({ param }) {
        super("Invalid ABI parameter.", {
          details: param
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParameterError"
        });
      }
    };
    __name(InvalidParameterError, "InvalidParameterError");
    SolidityProtectedKeywordError = class extends BaseError {
      constructor({ param, name }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SolidityProtectedKeywordError"
        });
      }
    };
    __name(SolidityProtectedKeywordError, "SolidityProtectedKeywordError");
    InvalidModifierError = class extends BaseError {
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidModifierError"
        });
      }
    };
    __name(InvalidModifierError, "InvalidModifierError");
    InvalidFunctionModifierError = class extends BaseError {
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
            `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidFunctionModifierError"
        });
      }
    };
    __name(InvalidFunctionModifierError, "InvalidFunctionModifierError");
    InvalidAbiTypeParameterError = class extends BaseError {
      constructor({ abiParameter }) {
        super("Invalid ABI parameter.", {
          details: JSON.stringify(abiParameter, null, 2),
          metaMessages: ["ABI parameter type is invalid."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiTypeParameterError"
        });
      }
    };
    __name(InvalidAbiTypeParameterError, "InvalidAbiTypeParameterError");
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/signature.js
var InvalidSignatureError, UnknownSignatureError, InvalidStructSignatureError;
var init_signature = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/signature.js"() {
    init_errors();
    InvalidSignatureError = class extends BaseError {
      constructor({ signature, type }) {
        super(`Invalid ${type} signature.`, {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidSignatureError"
        });
      }
    };
    __name(InvalidSignatureError, "InvalidSignatureError");
    UnknownSignatureError = class extends BaseError {
      constructor({ signature }) {
        super("Unknown signature.", {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSignatureError"
        });
      }
    };
    __name(UnknownSignatureError, "UnknownSignatureError");
    InvalidStructSignatureError = class extends BaseError {
      constructor({ signature }) {
        super("Invalid struct signature.", {
          details: signature,
          metaMessages: ["No properties exist."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidStructSignatureError"
        });
      }
    };
    __name(InvalidStructSignatureError, "InvalidStructSignatureError");
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/struct.js
var CircularReferenceError;
var init_struct = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/struct.js"() {
    init_errors();
    CircularReferenceError = class extends BaseError {
      constructor({ type }) {
        super("Circular reference detected.", {
          metaMessages: [`Struct "${type}" is a circular reference.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "CircularReferenceError"
        });
      }
    };
    __name(CircularReferenceError, "CircularReferenceError");
  }
});

// node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
var InvalidParenthesisError;
var init_splitParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js"() {
    init_errors();
    InvalidParenthesisError = class extends BaseError {
      constructor({ current, depth }) {
        super("Unbalanced parentheses.", {
          metaMessages: [
            `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
          ],
          details: `Depth "${depth}"`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParenthesisError"
        });
      }
    };
    __name(InvalidParenthesisError, "InvalidParenthesisError");
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/cache.js
function getParameterCacheKey(param, type, structs) {
  let structKey = "";
  if (structs)
    for (const struct of Object.entries(structs)) {
      if (!struct)
        continue;
      let propertyKey = "";
      for (const property of struct[1]) {
        propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
      }
      structKey += `(${struct[0]}{${propertyKey}})`;
    }
  if (type)
    return `${type}:${param}${structKey}`;
  return `${param}${structKey}`;
}
var parameterCache;
var init_cache = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/cache.js"() {
    __name(getParameterCacheKey, "getParameterCacheKey");
    parameterCache = /* @__PURE__ */ new Map([
      // Unnamed
      ["address", { type: "address" }],
      ["bool", { type: "bool" }],
      ["bytes", { type: "bytes" }],
      ["bytes32", { type: "bytes32" }],
      ["int", { type: "int256" }],
      ["int256", { type: "int256" }],
      ["string", { type: "string" }],
      ["uint", { type: "uint256" }],
      ["uint8", { type: "uint8" }],
      ["uint16", { type: "uint16" }],
      ["uint24", { type: "uint24" }],
      ["uint32", { type: "uint32" }],
      ["uint64", { type: "uint64" }],
      ["uint96", { type: "uint96" }],
      ["uint112", { type: "uint112" }],
      ["uint160", { type: "uint160" }],
      ["uint192", { type: "uint192" }],
      ["uint256", { type: "uint256" }],
      // Named
      ["address owner", { type: "address", name: "owner" }],
      ["address to", { type: "address", name: "to" }],
      ["bool approved", { type: "bool", name: "approved" }],
      ["bytes _data", { type: "bytes", name: "_data" }],
      ["bytes data", { type: "bytes", name: "data" }],
      ["bytes signature", { type: "bytes", name: "signature" }],
      ["bytes32 hash", { type: "bytes32", name: "hash" }],
      ["bytes32 r", { type: "bytes32", name: "r" }],
      ["bytes32 root", { type: "bytes32", name: "root" }],
      ["bytes32 s", { type: "bytes32", name: "s" }],
      ["string name", { type: "string", name: "name" }],
      ["string symbol", { type: "string", name: "symbol" }],
      ["string tokenURI", { type: "string", name: "tokenURI" }],
      ["uint tokenId", { type: "uint256", name: "tokenId" }],
      ["uint8 v", { type: "uint8", name: "v" }],
      ["uint256 balance", { type: "uint256", name: "balance" }],
      ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
      ["uint256 value", { type: "uint256", name: "value" }],
      // Indexed
      [
        "event:address indexed from",
        { type: "address", name: "from", indexed: true }
      ],
      ["event:address indexed to", { type: "address", name: "to", indexed: true }],
      [
        "event:uint indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ],
      [
        "event:uint256 indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ]
    ]);
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/utils.js
function parseSignature(signature, structs = {}) {
  if (isFunctionSignature(signature))
    return parseFunctionSignature(signature, structs);
  if (isEventSignature(signature))
    return parseEventSignature(signature, structs);
  if (isErrorSignature(signature))
    return parseErrorSignature(signature, structs);
  if (isConstructorSignature(signature))
    return parseConstructorSignature(signature, structs);
  if (isFallbackSignature(signature))
    return parseFallbackSignature(signature);
  if (isReceiveSignature(signature))
    return {
      type: "receive",
      stateMutability: "payable"
    };
  throw new UnknownSignatureError({ signature });
}
function parseFunctionSignature(signature, structs = {}) {
  const match = execFunctionSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "function" });
  const inputParams = splitParameters(match.parameters);
  const inputs = [];
  const inputLength = inputParams.length;
  for (let i = 0; i < inputLength; i++) {
    inputs.push(parseAbiParameter(inputParams[i], {
      modifiers: functionModifiers,
      structs,
      type: "function"
    }));
  }
  const outputs = [];
  if (match.returns) {
    const outputParams = splitParameters(match.returns);
    const outputLength = outputParams.length;
    for (let i = 0; i < outputLength; i++) {
      outputs.push(parseAbiParameter(outputParams[i], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
  }
  return {
    name: match.name,
    type: "function",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs,
    outputs
  };
}
function parseEventSignature(signature, structs = {}) {
  const match = execEventSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "event" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], {
      modifiers: eventModifiers,
      structs,
      type: "event"
    }));
  return { name: match.name, type: "event", inputs: abiParameters };
}
function parseErrorSignature(signature, structs = {}) {
  const match = execErrorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "error" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "error" }));
  return { name: match.name, type: "error", inputs: abiParameters };
}
function parseConstructorSignature(signature, structs = {}) {
  const match = execConstructorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "constructor" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "constructor" }));
  return {
    type: "constructor",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs: abiParameters
  };
}
function parseFallbackSignature(signature) {
  const match = execFallbackSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "fallback" });
  return {
    type: "fallback",
    stateMutability: match.stateMutability ?? "nonpayable"
  };
}
function parseAbiParameter(param, options) {
  const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
  if (parameterCache.has(parameterCacheKey))
    return parameterCache.get(parameterCacheKey);
  const isTuple = isTupleRegex.test(param);
  const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
  if (!match)
    throw new InvalidParameterError({ param });
  if (match.name && isSolidityKeyword(match.name))
    throw new SolidityProtectedKeywordError({ param, name: match.name });
  const name = match.name ? { name: match.name } : {};
  const indexed = match.modifier === "indexed" ? { indexed: true } : {};
  const structs = options?.structs ?? {};
  let type;
  let components = {};
  if (isTuple) {
    type = "tuple";
    const params = splitParameters(match.type);
    const components_ = [];
    const length = params.length;
    for (let i = 0; i < length; i++) {
      components_.push(parseAbiParameter(params[i], { structs }));
    }
    components = { components: components_ };
  } else if (match.type in structs) {
    type = "tuple";
    components = { components: structs[match.type] };
  } else if (dynamicIntegerRegex.test(match.type)) {
    type = `${match.type}256`;
  } else if (match.type === "address payable") {
    type = "address";
  } else {
    type = match.type;
    if (!(options?.type === "struct") && !isSolidityType(type))
      throw new UnknownSolidityTypeError({ type });
  }
  if (match.modifier) {
    if (!options?.modifiers?.has?.(match.modifier))
      throw new InvalidModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
    if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
      throw new InvalidFunctionModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
  }
  const abiParameter = {
    type: `${type}${match.array ?? ""}`,
    ...name,
    ...indexed,
    ...components
  };
  parameterCache.set(parameterCacheKey, abiParameter);
  return abiParameter;
}
function splitParameters(params, result = [], current = "", depth = 0) {
  const length = params.trim().length;
  for (let i = 0; i < length; i++) {
    const char = params[i];
    const tail = params.slice(i + 1);
    switch (char) {
      case ",":
        return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
      case "(":
        return splitParameters(tail, result, `${current}${char}`, depth + 1);
      case ")":
        return splitParameters(tail, result, `${current}${char}`, depth - 1);
      default:
        return splitParameters(tail, result, `${current}${char}`, depth);
    }
  }
  if (current === "")
    return result;
  if (depth !== 0)
    throw new InvalidParenthesisError({ current, depth });
  result.push(current.trim());
  return result;
}
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
function isSolidityKeyword(name) {
  return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
function isValidDataLocation(type, isArray) {
  return isArray || type === "bytes" || type === "string" || type === "tuple";
}
var abiParameterWithoutTupleRegex, abiParameterWithTupleRegex, dynamicIntegerRegex, protectedKeywordsRegex;
var init_utils = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/utils.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_splitParameters();
    init_cache();
    init_signatures();
    __name(parseSignature, "parseSignature");
    __name(parseFunctionSignature, "parseFunctionSignature");
    __name(parseEventSignature, "parseEventSignature");
    __name(parseErrorSignature, "parseErrorSignature");
    __name(parseConstructorSignature, "parseConstructorSignature");
    __name(parseFallbackSignature, "parseFallbackSignature");
    abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    dynamicIntegerRegex = /^u?int$/;
    __name(parseAbiParameter, "parseAbiParameter");
    __name(splitParameters, "splitParameters");
    __name(isSolidityType, "isSolidityType");
    protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
    __name(isSolidityKeyword, "isSolidityKeyword");
    __name(isValidDataLocation, "isValidDataLocation");
  }
});

// node_modules/abitype/dist/esm/human-readable/runtime/structs.js
function parseStructs(signatures) {
  const shallowStructs = {};
  const signaturesLength = signatures.length;
  for (let i = 0; i < signaturesLength; i++) {
    const signature = signatures[i];
    if (!isStructSignature(signature))
      continue;
    const match = execStructSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "struct" });
    const properties = match.properties.split(";");
    const components = [];
    const propertiesLength = properties.length;
    for (let k = 0; k < propertiesLength; k++) {
      const property = properties[k];
      const trimmed = property.trim();
      if (!trimmed)
        continue;
      const abiParameter = parseAbiParameter(trimmed, {
        type: "struct"
      });
      components.push(abiParameter);
    }
    if (!components.length)
      throw new InvalidStructSignatureError({ signature });
    shallowStructs[match.name] = components;
  }
  const resolvedStructs = {};
  const entries = Object.entries(shallowStructs);
  const entriesLength = entries.length;
  for (let i = 0; i < entriesLength; i++) {
    const [name, parameters] = entries[i];
    resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
  }
  return resolvedStructs;
}
function resolveStructs(abiParameters = [], structs = {}, ancestors = /* @__PURE__ */ new Set()) {
  const components = [];
  const length = abiParameters.length;
  for (let i = 0; i < length; i++) {
    const abiParameter = abiParameters[i];
    const isTuple = isTupleRegex.test(abiParameter.type);
    if (isTuple)
      components.push(abiParameter);
    else {
      const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
      if (!match?.type)
        throw new InvalidAbiTypeParameterError({ abiParameter });
      const { array, type } = match;
      if (type in structs) {
        if (ancestors.has(type))
          throw new CircularReferenceError({ type });
        components.push({
          ...abiParameter,
          type: `tuple${array ?? ""}`,
          components: resolveStructs(structs[type], structs, /* @__PURE__ */ new Set([...ancestors, type]))
        });
      } else {
        if (isSolidityType(type))
          components.push(abiParameter);
        else
          throw new UnknownTypeError({ type });
      }
    }
  }
  return components;
}
var typeWithoutTupleRegex;
var init_structs = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/structs.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_struct();
    init_signatures();
    init_utils();
    __name(parseStructs, "parseStructs");
    typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
    __name(resolveStructs, "resolveStructs");
  }
});

// node_modules/abitype/dist/esm/human-readable/parseAbi.js
function parseAbi(signatures) {
  const structs = parseStructs(signatures);
  const abi2 = [];
  const length = signatures.length;
  for (let i = 0; i < length; i++) {
    const signature = signatures[i];
    if (isStructSignature(signature))
      continue;
    abi2.push(parseSignature(signature, structs));
  }
  return abi2;
}
var init_parseAbi = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbi.js"() {
    init_signatures();
    init_structs();
    init_utils();
    __name(parseAbi, "parseAbi");
  }
});

// node_modules/abitype/dist/esm/human-readable/parseAbiItem.js
function parseAbiItem(signature) {
  let abiItem;
  if (typeof signature === "string")
    abiItem = parseSignature(signature);
  else {
    const structs = parseStructs(signature);
    const length = signature.length;
    for (let i = 0; i < length; i++) {
      const signature_ = signature[i];
      if (isStructSignature(signature_))
        continue;
      abiItem = parseSignature(signature_, structs);
      break;
    }
  }
  if (!abiItem)
    throw new InvalidAbiItemError({ signature });
  return abiItem;
}
var init_parseAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbiItem.js"() {
    init_abiItem();
    init_signatures();
    init_structs();
    init_utils();
    __name(parseAbiItem, "parseAbiItem");
  }
});

// node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js
function parseAbiParameters(params) {
  const abiParameters = [];
  if (typeof params === "string") {
    const parameters = splitParameters(params);
    const length = parameters.length;
    for (let i = 0; i < length; i++) {
      abiParameters.push(parseAbiParameter(parameters[i], { modifiers }));
    }
  } else {
    const structs = parseStructs(params);
    const length = params.length;
    for (let i = 0; i < length; i++) {
      const signature = params[i];
      if (isStructSignature(signature))
        continue;
      const parameters = splitParameters(signature);
      const length2 = parameters.length;
      for (let k = 0; k < length2; k++) {
        abiParameters.push(parseAbiParameter(parameters[k], { modifiers, structs }));
      }
    }
  }
  if (abiParameters.length === 0)
    throw new InvalidAbiParametersError({ params });
  return abiParameters;
}
var init_parseAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js"() {
    init_abiParameter();
    init_signatures();
    init_structs();
    init_utils();
    init_utils();
    __name(parseAbiParameters, "parseAbiParameters");
  }
});

// node_modules/abitype/dist/esm/exports/index.js
var init_exports = __esm({
  "node_modules/abitype/dist/esm/exports/index.js"() {
    init_formatAbiItem();
    init_formatAbiParameters();
    init_parseAbi();
    init_parseAbiItem();
    init_parseAbiParameters();
  }
});

// node_modules/viem/_esm/utils/getAction.js
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}
var init_getAction = __esm({
  "node_modules/viem/_esm/utils/getAction.js"() {
    __name(getAction, "getAction");
  }
});

// node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
var init_formatAbiItem2 = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItem.js"() {
    init_abi();
    __name(formatAbiItem2, "formatAbiItem");
    __name(formatAbiParams, "formatAbiParams");
    __name(formatAbiParam, "formatAbiParam");
  }
});

// node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
var init_isHex = __esm({
  "node_modules/viem/_esm/utils/data/isHex.js"() {
    __name(isHex, "isHex");
  }
});

// node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = __esm({
  "node_modules/viem/_esm/utils/data/size.js"() {
    init_isHex();
    __name(size, "size");
  }
});

// node_modules/viem/_esm/errors/version.js
var version2;
var init_version2 = __esm({
  "node_modules/viem/_esm/errors/version.js"() {
    version2 = "2.57.10";
  }
});

// node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError2;
var init_base = __esm({
  "node_modules/viem/_esm/errors/base.js"() {
    init_version2();
    errorConfig = {
      getDocsUrl: ({ docsBaseUrl, docsPath: docsPath8 = "", docsSlug }) => docsPath8 ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath8}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
      version: `viem@${version2}`
    };
    BaseError2 = class extends Error {
      constructor(shortMessage, args = {}) {
        const details = (() => {
          if (args.cause instanceof BaseError2)
            return args.cause.details;
          if (args.cause?.message)
            return args.cause.message;
          return args.details;
        })();
        const docsPath8 = (() => {
          if (args.cause instanceof BaseError2)
            return args.cause.docsPath || args.docsPath;
          return args.docsPath;
        })();
        const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath: docsPath8 });
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsUrl ? [`Docs: ${docsUrl}`] : [],
          ...details ? [`Details: ${details}`] : [],
          ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.details = details;
        this.docsPath = docsPath8;
        this.metaMessages = args.metaMessages;
        this.name = args.name ?? this.name;
        this.shortMessage = shortMessage;
        this.version = version2;
      }
      walk(fn) {
        return walk(this, fn);
      }
    };
    __name(BaseError2, "BaseError");
    __name(walk, "walk");
  }
});

// node_modules/viem/_esm/errors/abi.js
var AbiConstructorNotFoundError, AbiConstructorParamsNotFoundError, AbiDecodingDataSizeTooSmallError, AbiDecodingZeroDataError, AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiErrorInputsNotFoundError, AbiErrorNotFoundError, AbiErrorSignatureNotFoundError, AbiEventSignatureEmptyTopicsError, AbiEventSignatureNotFoundError, AbiEventNotFoundError, AbiFunctionNotFoundError, AbiFunctionOutputsNotFoundError, AbiFunctionSignatureNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, DecodeLogDataMismatch, DecodeLogTopicsMismatch, InvalidAbiEncodingTypeError, InvalidAbiDecodingTypeError, InvalidArrayError, InvalidDefinitionTypeError;
var init_abi = __esm({
  "node_modules/viem/_esm/errors/abi.js"() {
    init_formatAbiItem2();
    init_size();
    init_base();
    AbiConstructorNotFoundError = class extends BaseError2 {
      constructor({ docsPath: docsPath8 }) {
        super([
          "A constructor was not found on the ABI.",
          "Make sure you are using the correct ABI and that the constructor exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiConstructorNotFoundError"
        });
      }
    };
    __name(AbiConstructorNotFoundError, "AbiConstructorNotFoundError");
    AbiConstructorParamsNotFoundError = class extends BaseError2 {
      constructor({ docsPath: docsPath8 }) {
        super([
          "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
          "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiConstructorParamsNotFoundError"
        });
      }
    };
    __name(AbiConstructorParamsNotFoundError, "AbiConstructorParamsNotFoundError");
    AbiDecodingDataSizeTooSmallError = class extends BaseError2 {
      constructor({ data, params, size: size5 }) {
        super([`Data size of ${size5} bytes is too small for given parameters.`].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size5} bytes)`
          ],
          name: "AbiDecodingDataSizeTooSmallError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
        this.params = params;
        this.size = size5;
      }
    };
    __name(AbiDecodingDataSizeTooSmallError, "AbiDecodingDataSizeTooSmallError");
    AbiDecodingZeroDataError = class extends BaseError2 {
      constructor({ cause } = {}) {
        super('Cannot decode zero data ("0x") with ABI parameters.', {
          name: "AbiDecodingZeroDataError",
          cause
        });
      }
    };
    __name(AbiDecodingZeroDataError, "AbiDecodingZeroDataError");
    AbiEncodingArrayLengthMismatchError = class extends BaseError2 {
      constructor({ expectedLength, givenLength, type }) {
        super([
          `ABI encoding array length mismatch for type ${type}.`,
          `Expected length: ${expectedLength}`,
          `Given length: ${givenLength}`
        ].join("\n"), { name: "AbiEncodingArrayLengthMismatchError" });
      }
    };
    __name(AbiEncodingArrayLengthMismatchError, "AbiEncodingArrayLengthMismatchError");
    AbiEncodingBytesSizeMismatchError = class extends BaseError2 {
      constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
      }
    };
    __name(AbiEncodingBytesSizeMismatchError, "AbiEncodingBytesSizeMismatchError");
    AbiEncodingLengthMismatchError = class extends BaseError2 {
      constructor({ expectedLength, givenLength }) {
        super([
          "ABI encoding params/values length mismatch.",
          `Expected length (params): ${expectedLength}`,
          `Given length (values): ${givenLength}`
        ].join("\n"), { name: "AbiEncodingLengthMismatchError" });
      }
    };
    __name(AbiEncodingLengthMismatchError, "AbiEncodingLengthMismatchError");
    AbiErrorInputsNotFoundError = class extends BaseError2 {
      constructor(errorName, { docsPath: docsPath8 }) {
        super([
          `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
          "Cannot encode error result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the inputs exist on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorInputsNotFoundError"
        });
      }
    };
    __name(AbiErrorInputsNotFoundError, "AbiErrorInputsNotFoundError");
    AbiErrorNotFoundError = class extends BaseError2 {
      constructor(errorName, { docsPath: docsPath8 } = {}) {
        super([
          `Error ${errorName ? `"${errorName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorNotFoundError"
        });
      }
    };
    __name(AbiErrorNotFoundError, "AbiErrorNotFoundError");
    AbiErrorSignatureNotFoundError = class extends BaseError2 {
      constructor(signature, { docsPath: docsPath8, cause }) {
        super([
          `Encoded error signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorSignatureNotFoundError",
          cause
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.signature = signature;
      }
    };
    __name(AbiErrorSignatureNotFoundError, "AbiErrorSignatureNotFoundError");
    AbiEventSignatureEmptyTopicsError = class extends BaseError2 {
      constructor({ docsPath: docsPath8 }) {
        super("Cannot extract event signature from empty topics.", {
          docsPath: docsPath8,
          name: "AbiEventSignatureEmptyTopicsError"
        });
      }
    };
    __name(AbiEventSignatureEmptyTopicsError, "AbiEventSignatureEmptyTopicsError");
    AbiEventSignatureNotFoundError = class extends BaseError2 {
      constructor(signature, { docsPath: docsPath8 }) {
        super([
          `Encoded event signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiEventSignatureNotFoundError"
        });
      }
    };
    __name(AbiEventSignatureNotFoundError, "AbiEventSignatureNotFoundError");
    AbiEventNotFoundError = class extends BaseError2 {
      constructor(eventName, { docsPath: docsPath8 } = {}) {
        super([
          `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiEventNotFoundError"
        });
      }
    };
    __name(AbiEventNotFoundError, "AbiEventNotFoundError");
    AbiFunctionNotFoundError = class extends BaseError2 {
      constructor(functionName, { docsPath: docsPath8 } = {}) {
        super([
          `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionNotFoundError"
        });
      }
    };
    __name(AbiFunctionNotFoundError, "AbiFunctionNotFoundError");
    AbiFunctionOutputsNotFoundError = class extends BaseError2 {
      constructor(functionName, { docsPath: docsPath8 }) {
        super([
          `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
          "Cannot decode function result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionOutputsNotFoundError"
        });
      }
    };
    __name(AbiFunctionOutputsNotFoundError, "AbiFunctionOutputsNotFoundError");
    AbiFunctionSignatureNotFoundError = class extends BaseError2 {
      constructor(signature, { docsPath: docsPath8 }) {
        super([
          `Encoded function signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionSignatureNotFoundError"
        });
      }
    };
    __name(AbiFunctionSignatureNotFoundError, "AbiFunctionSignatureNotFoundError");
    AbiItemAmbiguityError = class extends BaseError2 {
      constructor(x, y) {
        super("Found ambiguous types in overloaded ABI items.", {
          metaMessages: [
            `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
            `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
            "",
            "These types encode differently and cannot be distinguished at runtime.",
            "Remove one of the ambiguous items in the ABI."
          ],
          name: "AbiItemAmbiguityError"
        });
      }
    };
    __name(AbiItemAmbiguityError, "AbiItemAmbiguityError");
    BytesSizeMismatchError = class extends BaseError2 {
      constructor({ expectedSize, givenSize }) {
        super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
          name: "BytesSizeMismatchError"
        });
      }
    };
    __name(BytesSizeMismatchError, "BytesSizeMismatchError");
    DecodeLogDataMismatch = class extends BaseError2 {
      constructor({ abiItem, data, params, size: size5 }) {
        super([
          `Data size of ${size5} bytes is too small for non-indexed event parameters.`
        ].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size5} bytes)`
          ],
          name: "DecodeLogDataMismatch"
        });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
        this.data = data;
        this.params = params;
        this.size = size5;
      }
    };
    __name(DecodeLogDataMismatch, "DecodeLogDataMismatch");
    DecodeLogTopicsMismatch = class extends BaseError2 {
      constructor({ abiItem, param }) {
        super([
          `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
        ].join("\n"), { name: "DecodeLogTopicsMismatch" });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
      }
    };
    __name(DecodeLogTopicsMismatch, "DecodeLogTopicsMismatch");
    InvalidAbiEncodingTypeError = class extends BaseError2 {
      constructor(type, { docsPath: docsPath8 }) {
        super([
          `Type "${type}" is not a valid encoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiEncodingType" });
      }
    };
    __name(InvalidAbiEncodingTypeError, "InvalidAbiEncodingTypeError");
    InvalidAbiDecodingTypeError = class extends BaseError2 {
      constructor(type, { docsPath: docsPath8 }) {
        super([
          `Type "${type}" is not a valid decoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiDecodingType" });
      }
    };
    __name(InvalidAbiDecodingTypeError, "InvalidAbiDecodingTypeError");
    InvalidArrayError = class extends BaseError2 {
      constructor(value) {
        super([`Value "${value}" is not a valid array.`].join("\n"), {
          name: "InvalidArrayError"
        });
      }
    };
    __name(InvalidArrayError, "InvalidArrayError");
    InvalidDefinitionTypeError = class extends BaseError2 {
      constructor(type) {
        super([
          `"${type}" is not a valid definition type.`,
          'Valid types: "function", "event", "error"'
        ].join("\n"), { name: "InvalidDefinitionTypeError" });
      }
    };
    __name(InvalidDefinitionTypeError, "InvalidDefinitionTypeError");
  }
});

// node_modules/viem/_esm/errors/log.js
var FilterTypeNotSupportedError;
var init_log = __esm({
  "node_modules/viem/_esm/errors/log.js"() {
    init_base();
    FilterTypeNotSupportedError = class extends BaseError2 {
      constructor(type) {
        super(`Filter type "${type}" is not supported.`, {
          name: "FilterTypeNotSupportedError"
        });
      }
    };
    __name(FilterTypeNotSupportedError, "FilterTypeNotSupportedError");
  }
});

// node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError, InvalidBytesLengthError;
var init_data = __esm({
  "node_modules/viem/_esm/errors/data.js"() {
    init_base();
    SliceOffsetOutOfBoundsError = class extends BaseError2 {
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size5}).`, { name: "SliceOffsetOutOfBoundsError" });
      }
    };
    __name(SliceOffsetOutOfBoundsError, "SliceOffsetOutOfBoundsError");
    SizeExceedsPaddingSizeError = class extends BaseError2 {
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size5}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
      }
    };
    __name(SizeExceedsPaddingSizeError, "SizeExceedsPaddingSizeError");
    InvalidBytesLengthError = class extends BaseError2 {
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size5} ${type} long.`, { name: "InvalidBytesLengthError" });
      }
    };
    __name(InvalidBytesLengthError, "InvalidBytesLengthError");
  }
});

// node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size5 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size5 });
  return padBytes(hexOrBytes, { dir, size: size5 });
}
function padHex(hex_, { dir, size: size5 = 32 } = {}) {
  if (size5 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size5 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size5,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
}
function padBytes(bytes, { dir, size: size5 = 32 } = {}) {
  if (size5 === null)
    return bytes;
  if (bytes.length > size5)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size5,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size5);
  for (let i = 0; i < size5; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
var init_pad = __esm({
  "node_modules/viem/_esm/utils/data/pad.js"() {
    init_data();
    __name(pad, "pad");
    __name(padHex, "padHex");
    __name(padBytes, "padBytes");
  }
});

// node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, InvalidBytesBooleanError, InvalidHexBooleanError, SizeOverflowError;
var init_encoding = __esm({
  "node_modules/viem/_esm/errors/encoding.js"() {
    init_base();
    IntegerOutOfRangeError = class extends BaseError2 {
      constructor({ max, min, signed, size: size5, value }) {
        super(`Number "${value}" is not in safe ${size5 ? `${size5 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
      }
    };
    __name(IntegerOutOfRangeError, "IntegerOutOfRangeError");
    InvalidBytesBooleanError = class extends BaseError2 {
      constructor(bytes) {
        super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
          name: "InvalidBytesBooleanError"
        });
      }
    };
    __name(InvalidBytesBooleanError, "InvalidBytesBooleanError");
    InvalidHexBooleanError = class extends BaseError2 {
      constructor(hex) {
        super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
      }
    };
    __name(InvalidHexBooleanError, "InvalidHexBooleanError");
    SizeOverflowError = class extends BaseError2 {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
      }
    };
    __name(SizeOverflowError, "SizeOverflowError");
  }
});

// node_modules/viem/_esm/utils/data/trim.js
function trim(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}
var init_trim = __esm({
  "node_modules/viem/_esm/utils/data/trim.js"() {
    __name(trim, "trim");
  }
});

// node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size5 }) {
  if (size(hexOrBytes) > size5)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size5
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size5 = Math.ceil((hex.length - 2) / 2);
  const max = (1n << BigInt(size5) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size5 * 2, "f")}`) - 1n;
}
function hexToBool(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = trim(hex);
  }
  if (trim(hex) === "0x00")
    return false;
  if (trim(hex) === "0x01")
    return true;
  throw new InvalidHexBooleanError(hex);
}
function hexToNumber(hex, opts = {}) {
  const value = hexToBigInt(hex, opts);
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw new IntegerOutOfRangeError({
      max: `${Number.MAX_SAFE_INTEGER}`,
      min: `${Number.MIN_SAFE_INTEGER}`,
      signed: opts.signed,
      size: opts.size,
      value: `${value}n`
    });
  return number;
}
var init_fromHex = __esm({
  "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
    init_encoding();
    init_size();
    init_trim();
    __name(assertSize, "assertSize");
    __name(hexToBigInt, "hexToBigInt");
    __name(hexToBool, "hexToBool");
    __name(hexToNumber, "hexToNumber");
  }
});

// node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size5 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size5) {
    if (signed)
      maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size5,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size5 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size5)
    return pad(hex, { size: size5 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm({
  "node_modules/viem/_esm/utils/encoding/toHex.js"() {
    init_encoding();
    init_pad();
    init_fromHex();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    __name(toHex, "toHex");
    __name(boolToHex, "boolToHex");
    __name(bytesToHex, "bytesToHex");
    __name(numberToHex, "numberToHex");
    encoder = /* @__PURE__ */ new TextEncoder();
    __name(stringToHex, "stringToHex");
  }
});

// node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return void 0;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index2 = 0, j = 0; index2 < length; index2++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError2(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index2] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
var encoder2, charCodeMap;
var init_toBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
    init_base();
    init_isHex();
    init_pad();
    init_fromHex();
    init_toHex();
    encoder2 = /* @__PURE__ */ new TextEncoder();
    __name(toBytes, "toBytes");
    __name(boolToBytes, "boolToBytes");
    charCodeMap = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
    __name(charCodeToBase16, "charCodeToBase16");
    __name(hexToBytes, "hexToBytes");
    __name(numberToBytes, "numberToBytes");
    __name(stringToBytes, "stringToBytes");
  }
});

// node_modules/@noble/hashes/esm/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH, rotlSL, rotlBH, rotlBL;
var init_u64 = __esm({
  "node_modules/@noble/hashes/esm/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    __name(fromBig, "fromBig");
    __name(split, "split");
    rotlSH = /* @__PURE__ */ __name((h, l, s) => h << s | l >>> 32 - s, "rotlSH");
    rotlSL = /* @__PURE__ */ __name((h, l, s) => l << s | h >>> 32 - s, "rotlSL");
    rotlBH = /* @__PURE__ */ __name((h, l, s) => l << s - 32 | h >>> 64 - s, "rotlBH");
    rotlBL = /* @__PURE__ */ __name((h, l, s) => h << s - 32 | l >>> 64 - s, "rotlBL");
  }
});

// node_modules/@noble/hashes/esm/crypto.js
var crypto2;
var init_crypto = __esm({
  "node_modules/@noble/hashes/esm/crypto.js"() {
    crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});

// node_modules/@noble/hashes/esm/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad4 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad4);
    pad4 += a.length;
  }
  return res;
}
function createHasher(hashCons) {
  const hashC = /* @__PURE__ */ __name((msg) => hashCons().update(toBytes2(msg)).digest(), "hashC");
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto2 && typeof crypto2.randomBytes === "function") {
    return Uint8Array.from(crypto2.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE, swap32IfBE, Hash;
var init_utils2 = __esm({
  "node_modules/@noble/hashes/esm/utils.js"() {
    init_crypto();
    __name(isBytes, "isBytes");
    __name(anumber, "anumber");
    __name(abytes, "abytes");
    __name(ahash, "ahash");
    __name(aexists, "aexists");
    __name(aoutput, "aoutput");
    __name(u32, "u32");
    __name(clean, "clean");
    __name(createView, "createView");
    __name(rotr, "rotr");
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    __name(byteSwap, "byteSwap");
    __name(byteSwap32, "byteSwap32");
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    __name(utf8ToBytes, "utf8ToBytes");
    __name(toBytes2, "toBytes");
    __name(concatBytes, "concatBytes");
    Hash = class {
    };
    __name(Hash, "Hash");
    __name(createHasher, "createHasher");
    __name(randomBytes, "randomBytes");
  }
});

// node_modules/@noble/hashes/esm/sha3.js
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, keccak_256;
var init_sha3 = __esm({
  "node_modules/@noble/hashes/esm/sha3.js"() {
    init_u64();
    init_utils2();
    _0n = BigInt(0);
    _1n = BigInt(1);
    _2n = BigInt(2);
    _7n = BigInt(7);
    _256n = BigInt(256);
    _0x71n = BigInt(113);
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [y, (2 * x + 3 * y) % 5];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t = _0n;
      for (let j = 0; j < 7; j++) {
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n)
          t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t);
    }
    IOTAS = split(_SHA3_IOTA, true);
    SHA3_IOTA_H = IOTAS[0];
    SHA3_IOTA_L = IOTAS[1];
    rotlH = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), "rotlH");
    rotlL = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), "rotlL");
    __name(keccakP, "keccakP");
    Keccak = class extends Hash {
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        this.enableXOF = false;
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        anumber(outputLen);
        if (!(0 < blockLen && blockLen < 200))
          throw new Error("only keccak-f1600 function is supported");
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        swap32IfBE(this.state32);
        keccakP(this.state32, this.rounds);
        swap32IfBE(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { blockLen, state } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i = 0; i < take; i++)
            state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen)
            this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished)
          return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1)
          this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen)
            this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance");
        return this.writeInto(out);
      }
      xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
        aoutput(out, this);
        if (this.finished)
          throw new Error("digest() was already called");
        this.writeInto(out);
        this.destroy();
        return out;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true;
        clean(this.state);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
      }
    };
    __name(Keccak, "Keccak");
    gen = /* @__PURE__ */ __name((suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen)), "gen");
    keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
  }
});

// node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_keccak256 = __esm({
  "node_modules/viem/_esm/utils/hash/keccak256.js"() {
    init_sha3();
    init_isHex();
    init_toBytes();
    init_toHex();
    __name(keccak256, "keccak256");
  }
});

// node_modules/viem/_esm/utils/hash/hashSignature.js
function hashSignature(sig) {
  return hash(sig);
}
var hash;
var init_hashSignature = __esm({
  "node_modules/viem/_esm/utils/hash/hashSignature.js"() {
    init_toBytes();
    init_keccak256();
    hash = /* @__PURE__ */ __name((value) => keccak256(toBytes(value)), "hash");
    __name(hashSignature, "hashSignature");
  }
});

// node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (!current.endsWith(",") && !current.endsWith("(")) {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError2("Unable to normalize signature.");
  return result;
}
var init_normalizeSignature = __esm({
  "node_modules/viem/_esm/utils/hash/normalizeSignature.js"() {
    init_base();
    __name(normalizeSignature, "normalizeSignature");
  }
});

// node_modules/viem/_esm/utils/hash/toSignature.js
var toSignature;
var init_toSignature = __esm({
  "node_modules/viem/_esm/utils/hash/toSignature.js"() {
    init_exports();
    init_normalizeSignature();
    toSignature = /* @__PURE__ */ __name((def) => {
      const def_ = (() => {
        if (typeof def === "string")
          return def;
        return formatAbiItem(def);
      })();
      return normalizeSignature(def_);
    }, "toSignature");
  }
});

// node_modules/viem/_esm/utils/hash/toSignatureHash.js
function toSignatureHash(fn) {
  return hashSignature(toSignature(fn));
}
var init_toSignatureHash = __esm({
  "node_modules/viem/_esm/utils/hash/toSignatureHash.js"() {
    init_hashSignature();
    init_toSignature();
    __name(toSignatureHash, "toSignatureHash");
  }
});

// node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector;
var init_toEventSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toEventSelector.js"() {
    init_toSignatureHash();
    toEventSelector = toSignatureHash;
  }
});

// node_modules/viem/_esm/errors/address.js
var InvalidAddressError;
var init_address = __esm({
  "node_modules/viem/_esm/errors/address.js"() {
    init_base();
    InvalidAddressError = class extends BaseError2 {
      constructor({ address }) {
        super(`Address "${address}" is invalid.`, {
          metaMessages: [
            "- Address must be a hex value of 20 bytes (40 hex characters).",
            "- Address must match its checksum counterpart."
          ],
          name: "InvalidAddressError"
        });
      }
    };
    __name(InvalidAddressError, "InvalidAddressError");
  }
});

// node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm({
  "node_modules/viem/_esm/utils/lru.js"() {
    LruMap = class extends Map {
      constructor(size5) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size5;
      }
      get(key) {
        const value = super.get(key);
        if (super.has(key)) {
          super.delete(key);
          super.set(key, value);
        }
        return value;
      }
      set(key, value) {
        if (super.has(key))
          super.delete(key);
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize) {
          const firstKey = super.keys().next().value;
          if (firstKey !== void 0)
            super.delete(firstKey);
        }
        return this;
      }
    };
    __name(LruMap, "LruMap");
  }
});

// node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash3 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash3[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash3[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
function getAddress(address, chainId) {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address });
  return checksumAddress(address, chainId);
}
var checksumAddressCache;
var init_getAddress = __esm({
  "node_modules/viem/_esm/utils/address/getAddress.js"() {
    init_address();
    init_toBytes();
    init_keccak256();
    init_lru();
    init_isAddress();
    checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
    __name(checksumAddress, "checksumAddress");
    __name(getAddress, "getAddress");
  }
});

// node_modules/viem/_esm/utils/address/isAddress.js
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey2 = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey2))
    return isAddressCache.get(cacheKey2);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey2, result);
  return result;
}
var addressRegex, isAddressCache;
var init_isAddress = __esm({
  "node_modules/viem/_esm/utils/address/isAddress.js"() {
    init_lru();
    init_getAddress();
    addressRegex = /^0x[a-fA-F0-9]{40}$/;
    isAddressCache = /* @__PURE__ */ new LruMap(8192);
    __name(isAddress, "isAddress");
  }
});

// node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
var init_concat = __esm({
  "node_modules/viem/_esm/utils/data/concat.js"() {
    __name(concat, "concat");
    __name(concatBytes2, "concatBytes");
    __name(concatHex, "concatHex");
  }
});

// node_modules/viem/_esm/utils/data/slice.js
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
var init_slice = __esm({
  "node_modules/viem/_esm/utils/data/slice.js"() {
    init_data();
    init_isHex();
    init_size();
    __name(slice, "slice");
    __name(assertStartOffset, "assertStartOffset");
    __name(assertEndOffset, "assertEndOffset");
    __name(sliceBytes, "sliceBytes");
    __name(sliceHex, "sliceHex");
  }
});

// node_modules/viem/_esm/utils/regex.js
var bytesRegex2, integerRegex2;
var init_regex2 = __esm({
  "node_modules/viem/_esm/utils/regex.js"() {
    bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  }
});

// node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  return encodeParams(preparedParams);
}
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i = 0; i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
  }
  return preparedParams;
}
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    const [, , size5 = "256"] = integerRegex2.exec(param.type) ?? [];
    return encodeNumber(value, {
      signed,
      size: Number(size5)
    });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded);
      dynamicSize += size(encoded);
    } else {
      staticParams.push(encoded);
    }
  }
  return concatHex([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = value.length === 0 && isDynamicType(param);
  const preparedParams = [];
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: concatHex([length2, data])
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concatHex(preparedParams.map(({ encoded }) => encoded))
  };
}
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concatHex([
        padHex(numberToHex(bytesSize, { size: 32 })),
        value_
      ])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize, 10))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize, 10),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
function encodeNumber(value, { signed, size: size5 = 256 }) {
  if (typeof size5 === "number") {
    const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size5 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
function encodeString(value) {
  const hexValue = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue) / 32);
  const parts = [];
  for (let i = 0; i < partsLength; i++) {
    parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concatHex([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts
    ])
  };
}
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i = 0; i < param.components.length; i++) {
    const param_ = param.components[i];
    const index2 = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index2]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concatHex(preparedParams.map(({ encoded }) => encoded))
  };
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
function isDynamicType(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components.some(isDynamicType);
  const arrayComponents = getArrayComponents(type);
  if (arrayComponents)
    return isDynamicType({ ...param, type: arrayComponents[1] });
  return false;
}
var init_encodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/encodeAbiParameters.js"() {
    init_abi();
    init_address();
    init_base();
    init_encoding();
    init_isAddress();
    init_concat();
    init_pad();
    init_size();
    init_slice();
    init_toHex();
    init_regex2();
    __name(encodeAbiParameters, "encodeAbiParameters");
    __name(prepareParams, "prepareParams");
    __name(prepareParam, "prepareParam");
    __name(encodeParams, "encodeParams");
    __name(encodeAddress, "encodeAddress");
    __name(encodeArray, "encodeArray");
    __name(encodeBytes, "encodeBytes");
    __name(encodeBool, "encodeBool");
    __name(encodeNumber, "encodeNumber");
    __name(encodeString, "encodeString");
    __name(encodeTuple, "encodeTuple");
    __name(getArrayComponents, "getArrayComponents");
    __name(isDynamicType, "isDynamicType");
  }
});

// node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector;
var init_toFunctionSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toFunctionSelector.js"() {
    init_slice();
    init_toSignatureHash();
    toFunctionSelector = /* @__PURE__ */ __name((fn) => slice(toSignatureHash(fn), 0, 4), "toFunctionSelector");
  }
});

// node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
  const { abi: abi2, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi2.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return void 0;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return argType === "object" && isArgOfType(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
          ...abiParameter,
          // Pop off `[]` or `[M]` from end of type
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return isAddress(args[parameterIndex], { strict: false });
      if (types.includes("address") && types.includes("bytes"))
        return isAddress(args[parameterIndex], { strict: false });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_getAbiItem = __esm({
  "node_modules/viem/_esm/utils/abi/getAbiItem.js"() {
    init_abi();
    init_isHex();
    init_isAddress();
    init_toEventSelector();
    init_toFunctionSelector();
    __name(getAbiItem, "getAbiItem");
    __name(isArgOfType, "isArgOfType");
    __name(getAmbiguousTypes, "getAmbiguousTypes");
  }
});

// node_modules/viem/_esm/utils/abi/encodeEventTopics.js
function encodeEventTopics(parameters) {
  const { abi: abi2, eventName, args } = parameters;
  let abiItem = abi2[0];
  if (eventName) {
    const item = getAbiItem({ abi: abi2, name: eventName });
    if (!item)
      throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "event")
    throw new AbiEventNotFoundError(void 0, { docsPath });
  let topics = [];
  if (args && "inputs" in abiItem) {
    const indexedInputs = abiItem.inputs?.filter((param) => "indexed" in param && param.indexed);
    const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
    if (args_.length > 0) {
      topics = indexedInputs?.map((param, i) => {
        if (Array.isArray(args_[i]))
          return args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }));
        return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({ param, value: args_[i] }) : null;
      }) ?? [];
    }
  }
  if (abiItem.anonymous)
    return topics;
  const definition = formatAbiItem2(abiItem);
  const signature = toEventSelector(definition);
  return [signature, ...topics];
}
function encodeArg({ param, value }) {
  if (param.type === "string")
    return keccak256(stringToBytes(value));
  if (param.type === "bytes")
    return keccak256(toBytes(value));
  if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type);
  return encodeAbiParameters([param], [value]);
}
var docsPath;
var init_encodeEventTopics = __esm({
  "node_modules/viem/_esm/utils/abi/encodeEventTopics.js"() {
    init_abi();
    init_log();
    init_toBytes();
    init_keccak256();
    init_toEventSelector();
    init_encodeAbiParameters();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath = "/docs/contract/encodeEventTopics";
    __name(encodeEventTopics, "encodeEventTopics");
    __name(encodeArg, "encodeArg");
  }
});

// node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
function createFilterRequestScope(client, { method }) {
  const requestMap = {};
  if (client.transport.type === "fallback")
    client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
      if (status === "success" && method === method_)
        requestMap[id] = transport.request;
    });
  return (id) => requestMap[id] || client.request;
}
var init_createFilterRequestScope = __esm({
  "node_modules/viem/_esm/utils/filters/createFilterRequestScope.js"() {
    __name(createFilterRequestScope, "createFilterRequestScope");
  }
});

// node_modules/viem/_esm/actions/public/createContractEventFilter.js
async function createContractEventFilter(client, parameters) {
  const { address, abi: abi2, args, eventName, fromBlock, strict, toBlock } = parameters;
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  const topics = eventName ? encodeEventTopics({
    abi: abi2,
    args,
    eventName
  }) : void 0;
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        topics
      }
    ]
  });
  return {
    abi: abi2,
    args,
    eventName,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    type: "event"
  };
}
var init_createContractEventFilter = __esm({
  "node_modules/viem/_esm/actions/public/createContractEventFilter.js"() {
    init_encodeEventTopics();
    init_toHex();
    init_createFilterRequestScope();
    __name(createContractEventFilter, "createContractEventFilter");
  }
});

// node_modules/viem/_esm/accounts/utils/parseAccount.js
function parseAccount(account) {
  if (typeof account === "string")
    return { address: account, type: "json-rpc" };
  return account;
}
var init_parseAccount = __esm({
  "node_modules/viem/_esm/accounts/utils/parseAccount.js"() {
    __name(parseAccount, "parseAccount");
  }
});

// node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
function prepareEncodeFunctionData(parameters) {
  const { abi: abi2, args, functionName } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({
      abi: abi2,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath2 });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
var docsPath2;
var init_prepareEncodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js"() {
    init_abi();
    init_toFunctionSelector();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath2 = "/docs/contract/encodeFunctionData";
    __name(prepareEncodeFunctionData, "prepareEncodeFunctionData");
  }
});

// node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi: abi2, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi2[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0;
  return concatHex([signature, data ?? "0x"]);
}
var init_encodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionData.js"() {
    init_concat();
    init_encodeAbiParameters();
    init_prepareEncodeFunctionData();
    __name(encodeFunctionData, "encodeFunctionData");
  }
});

// node_modules/viem/_esm/constants/solidity.js
var panicReasons, solidityError, solidityPanic;
var init_solidity = __esm({
  "node_modules/viem/_esm/constants/solidity.js"() {
    panicReasons = {
      1: "An `assert` condition failed.",
      17: "Arithmetic operation resulted in underflow or overflow.",
      18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
      33: "Attempted to convert to an invalid type.",
      34: "Attempted to access a storage byte array that is incorrectly encoded.",
      49: "Performed `.pop()` on an empty array",
      50: "Array index is out of bounds.",
      65: "Allocated too much memory or created an array which is too large.",
      81: "Attempted to call a zero-initialized variable of internal function type."
    };
    solidityError = {
      inputs: [
        {
          name: "message",
          type: "string"
        }
      ],
      name: "Error",
      type: "error"
    };
    solidityPanic = {
      inputs: [
        {
          name: "reason",
          type: "uint256"
        }
      ],
      name: "Panic",
      type: "error"
    };
  }
});

// node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
var init_cursor = __esm({
  "node_modules/viem/_esm/errors/cursor.js"() {
    init_base();
    NegativeOffsetError = class extends BaseError2 {
      constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`, {
          name: "NegativeOffsetError"
        });
      }
    };
    __name(NegativeOffsetError, "NegativeOffsetError");
    PositionOutOfBoundsError = class extends BaseError2 {
      constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
      }
    };
    __name(PositionOutOfBoundsError, "PositionOutOfBoundsError");
    RecursiveReadLimitExceededError = class extends BaseError2 {
      constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
      }
    };
    __name(RecursiveReadLimitExceededError, "RecursiveReadLimitExceededError");
  }
});

// node_modules/viem/_esm/utils/cursor.js
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer ?? bytes, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor;
var init_cursor2 = __esm({
  "node_modules/viem/_esm/utils/cursor.js"() {
    init_cursor();
    staticCursor = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: /* @__PURE__ */ new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new RecursiveReadLimitExceededError({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit
          });
      },
      assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
          throw new PositionOutOfBoundsError({
            length: this.bytes.length,
            position
          });
      },
      decrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
      },
      getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
      },
      incrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
      },
      inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
      },
      inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
      },
      inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
      },
      inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
      },
      pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
      },
      pushBytes(bytes) {
        this.assertPosition(this.position + bytes.length - 1);
        this.bytes.set(bytes, this.position);
        this.position += bytes.length;
      },
      pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
      },
      pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
      },
      pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
      },
      pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
      },
      readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
      },
      readBytes(length, size5) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size5 ?? length;
        return value;
      },
      readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
      },
      readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
      },
      readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
      },
      readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => this.position = oldPosition;
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
          return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
          this.recursiveReadCount++;
      }
    };
    __name(createCursor, "createCursor");
  }
});

// node_modules/viem/_esm/utils/encoding/fromBytes.js
function bytesToBigInt(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes);
  return hexToBigInt(hex, opts);
}
function bytesToBool(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes);
  }
  if (bytes.length > 1 || bytes[0] > 1)
    throw new InvalidBytesBooleanError(bytes);
  return Boolean(bytes[0]);
}
function bytesToNumber(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes);
  return hexToNumber(hex, opts);
}
function bytesToString(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes, { dir: "right" });
  }
  return new TextDecoder().decode(bytes);
}
var init_fromBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/fromBytes.js"() {
    init_encoding();
    init_trim();
    init_fromHex();
    init_toHex();
    __name(bytesToBigInt, "bytesToBigInt");
    __name(bytesToBool, "bytesToBool");
    __name(bytesToNumber, "bytesToNumber");
    __name(bytesToString, "bytesToString");
  }
});

// node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
function decodeAbiParameters(params, data) {
  const bytes = typeof data === "string" ? hexToBytes(data) : data;
  const cursor = createCursor(bytes);
  if (size(bytes) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError();
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === "string" ? data : bytesToHex(data),
      params,
      size: size(data)
    });
  let consumed = 0;
  const values = [];
  for (let i = 0; i < params.length; ++i) {
    const param = params[i];
    if (consumed < bytes.length)
      cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter(cursor, param, {
      staticPosition: 0
    });
    consumed += consumed_;
    values.push(data2);
  }
  return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray(cursor, { ...param, type }, { length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple(cursor, param, { staticPosition });
  if (param.type === "address")
    return decodeAddress(cursor);
  if (param.type === "bool")
    return decodeBool(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber(cursor, param);
  if (param.type === "string")
    return decodeString(cursor, { staticPosition });
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
function decodeAddress(cursor) {
  const value = cursor.readBytes(32);
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
  if (length === null) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength;
    cursor.setPosition(start);
    const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
    const dynamicChild = hasDynamicChild(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0; i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
      if (consumed_ === 0) {
        cursor.assertReadLimit();
        cursor._touch();
      }
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0; i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter(cursor, param, {
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0; i < length; ++i) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
    if (consumed_ === 0) {
      cursor.assertReadLimit();
      cursor._touch();
    }
  }
  return [value, consumed];
}
function decodeBool(cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
  const [_, size5] = param.type.split("bytes");
  if (!size5) {
    const offset = bytesToNumber(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [bytesToHex(data), 32];
  }
  const value = bytesToHex(cursor.readBytes(Number.parseInt(size5, 10), 32));
  return [value, 32];
}
function decodeNumber(cursor, param) {
  const signed = param.type.startsWith("int");
  const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size5 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
    32
  ];
}
function decodeTuple(cursor, param, { staticPosition }) {
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter(cursor, component, {
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
  const offset = bytesToNumber(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = bytesToNumber(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = bytesToString(data);
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
var sizeOfLength, sizeOfOffset;
var init_decodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/decodeAbiParameters.js"() {
    init_abi();
    init_getAddress();
    init_cursor2();
    init_size();
    init_slice();
    init_fromBytes();
    init_toBytes();
    init_toHex();
    init_encodeAbiParameters();
    __name(decodeAbiParameters, "decodeAbiParameters");
    __name(decodeParameter, "decodeParameter");
    sizeOfLength = 32;
    sizeOfOffset = 32;
    __name(decodeAddress, "decodeAddress");
    __name(decodeArray, "decodeArray");
    __name(decodeBool, "decodeBool");
    __name(decodeBytes, "decodeBytes");
    __name(decodeNumber, "decodeNumber");
    __name(decodeTuple, "decodeTuple");
    __name(decodeString, "decodeString");
    __name(hasDynamicChild, "hasDynamicChild");
  }
});

// node_modules/viem/_esm/utils/abi/decodeErrorResult.js
function decodeErrorResult(parameters) {
  const { abi: abi2, data, cause } = parameters;
  const signature = slice(data, 0, 4);
  if (signature === "0x")
    throw new AbiDecodingZeroDataError({ cause });
  const abi_ = [...abi2 || [], solidityError, solidityPanic];
  const abiItem = abi_.find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeErrorResult",
      cause
    });
  return {
    abiItem,
    args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : void 0,
    errorName: abiItem.name
  };
}
var init_decodeErrorResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeErrorResult.js"() {
    init_solidity();
    init_abi();
    init_slice();
    init_toFunctionSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
    __name(decodeErrorResult, "decodeErrorResult");
  }
});

// node_modules/viem/_esm/utils/stringify.js
var stringify;
var init_stringify = __esm({
  "node_modules/viem/_esm/utils/stringify.js"() {
    stringify = /* @__PURE__ */ __name((value, replacer, space) => JSON.stringify(value, (key, value_) => {
      const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
      return typeof replacer === "function" ? replacer(key, value2) : value2;
    }, space), "stringify");
  }
});

// node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
  if (!("name" in abiItem))
    return;
  if (!("inputs" in abiItem))
    return;
  if (!abiItem.inputs)
    return;
  return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
}
var init_formatAbiItemWithArgs = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js"() {
    init_stringify();
    __name(formatAbiItemWithArgs, "formatAbiItemWithArgs");
  }
});

// node_modules/viem/_esm/utils/unit/Value.js
function format(value, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0)
    throw new InvalidDecimalsError({ decimals });
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
function formatEther(wei, unit = "wei") {
  return format(wei, exponents.ether - exponents[unit]);
}
function formatGwei(wei, unit = "wei") {
  return format(wei, exponents.gwei - exponents[unit]);
}
function from(value, decimals = 0) {
  if (!Number.isInteger(decimals) || decimals < 0)
    throw new InvalidDecimalsError({ decimals });
  if (!/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer = "", fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  if (integer === "")
    integer = "0";
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (fraction.length > 0 && Number.parseInt(fraction[0], 10) >= 5)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const left = fraction.slice(0, decimals);
    const roundDigit = Number.parseInt(fraction.slice(decimals, decimals + 1), 10);
    if (roundDigit >= 5) {
      const carried = carry(left);
      if (carried.length > decimals) {
        fraction = carried.slice(1);
        integer = `${BigInt(integer) + 1n}`;
      } else {
        fraction = carried;
      }
    } else {
      fraction = left;
    }
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}
function carry(digits) {
  const out = digits.split("");
  let i = out.length - 1;
  while (i >= 0) {
    const d = Number.parseInt(out[i], 10) + 1;
    if (d < 10) {
      out[i] = String(d);
      return out.join("");
    }
    out[i] = "0";
    i--;
  }
  return `1${out.join("")}`;
}
var exponents, InvalidDecimalNumberError, InvalidDecimalsError;
var init_Value = __esm({
  "node_modules/viem/_esm/utils/unit/Value.js"() {
    exponents = {
      wei: 0,
      gwei: 9,
      szabo: 12,
      finney: 15,
      ether: 18
    };
    __name(format, "format");
    __name(formatEther, "formatEther");
    __name(formatGwei, "formatGwei");
    __name(from, "from");
    __name(carry, "carry");
    InvalidDecimalNumberError = class extends Error {
      constructor({ value }) {
        super(`Value \`${value}\` is not a valid decimal number.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Value.InvalidDecimalNumberError"
        });
      }
    };
    __name(InvalidDecimalNumberError, "InvalidDecimalNumberError");
    InvalidDecimalsError = class extends Error {
      constructor({ decimals }) {
        super(`\`decimals\` must be a non-negative integer. Got \`${decimals}\`.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Value.InvalidDecimalsError"
        });
      }
    };
    __name(InvalidDecimalsError, "InvalidDecimalsError");
  }
});

// node_modules/viem/_esm/utils/unit/formatEther.js
function formatEther2(wei, unit = "wei") {
  return formatEther(wei, unit);
}
var init_formatEther = __esm({
  "node_modules/viem/_esm/utils/unit/formatEther.js"() {
    init_Value();
    __name(formatEther2, "formatEther");
  }
});

// node_modules/viem/_esm/utils/unit/formatGwei.js
function formatGwei2(wei, unit = "wei") {
  return formatGwei(wei, unit);
}
var init_formatGwei = __esm({
  "node_modules/viem/_esm/utils/unit/formatGwei.js"() {
    init_Value();
    __name(formatGwei2, "formatGwei");
  }
});

// node_modules/viem/_esm/errors/stateOverride.js
function prettyStateMapping(stateMapping) {
  return stateMapping.reduce((pretty, { slot, value }) => {
    return `${pretty}        ${slot}: ${value}
`;
  }, "");
}
function prettyStateOverride(stateOverride) {
  return stateOverride.reduce((pretty, { address, ...state }) => {
    let val = `${pretty}    ${address}:
`;
    if (state.nonce)
      val += `      nonce: ${state.nonce}
`;
    if (state.balance)
      val += `      balance: ${state.balance}
`;
    if (state.code)
      val += `      code: ${state.code}
`;
    if (state.state) {
      val += "      state:\n";
      val += prettyStateMapping(state.state);
    }
    if (state.stateDiff) {
      val += "      stateDiff:\n";
      val += prettyStateMapping(state.stateDiff);
    }
    return val;
  }, "  State Override:\n").slice(0, -1);
}
var AccountStateConflictError, StateAssignmentConflictError;
var init_stateOverride = __esm({
  "node_modules/viem/_esm/errors/stateOverride.js"() {
    init_base();
    AccountStateConflictError = class extends BaseError2 {
      constructor({ address }) {
        super(`State for account "${address}" is set multiple times.`, {
          name: "AccountStateConflictError"
        });
      }
    };
    __name(AccountStateConflictError, "AccountStateConflictError");
    StateAssignmentConflictError = class extends BaseError2 {
      constructor() {
        super("state and stateDiff are set on the same account.", {
          name: "StateAssignmentConflictError"
        });
      }
    };
    __name(StateAssignmentConflictError, "StateAssignmentConflictError");
    __name(prettyStateMapping, "prettyStateMapping");
    __name(prettyStateOverride, "prettyStateOverride");
  }
});

// node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === void 0 || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}
var FeePayerNonceMismatchError, InvalidLegacyVError, InvalidSerializableTransactionError, InvalidStorageKeySizeError, TransactionExecutionError, TransactionNotFoundError, TransactionReceiptNotFoundError, TransactionReceiptRevertedError, WaitForTransactionReceiptTimeoutError;
var init_transaction = __esm({
  "node_modules/viem/_esm/errors/transaction.js"() {
    init_formatEther();
    init_formatGwei();
    init_base();
    __name(prettyPrint, "prettyPrint");
    FeePayerNonceMismatchError = class extends BaseError2 {
      constructor({ filledNonce, requestedNonce }) {
        super("The filled transaction nonce does not match the requested nonce.", {
          metaMessages: [
            `Requested Nonce: ${requestedNonce}`,
            `Filled Nonce: ${filledNonce}`
          ],
          name: "FeePayerNonceMismatchError"
        });
      }
    };
    __name(FeePayerNonceMismatchError, "FeePayerNonceMismatchError");
    InvalidLegacyVError = class extends BaseError2 {
      constructor({ v }) {
        super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
          name: "InvalidLegacyVError"
        });
      }
    };
    __name(InvalidLegacyVError, "InvalidLegacyVError");
    InvalidSerializableTransactionError = class extends BaseError2 {
      constructor({ transaction }) {
        super("Cannot infer a transaction type from provided transaction.", {
          metaMessages: [
            "Provided Transaction:",
            "{",
            prettyPrint(transaction),
            "}",
            "",
            "To infer the type, either provide:",
            "- a `type` to the Transaction, or",
            "- an EIP-1559 Transaction with `maxFeePerGas`, or",
            "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
            "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
            "- an EIP-7702 Transaction with `authorizationList`, or",
            "- a Legacy Transaction with `gasPrice`"
          ],
          name: "InvalidSerializableTransactionError"
        });
      }
    };
    __name(InvalidSerializableTransactionError, "InvalidSerializableTransactionError");
    InvalidStorageKeySizeError = class extends BaseError2 {
      constructor({ storageKey }) {
        super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
      }
    };
    __name(InvalidStorageKeySizeError, "InvalidStorageKeySizeError");
    TransactionExecutionError = class extends BaseError2 {
      constructor(cause, { account, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
        const prettyArgs = prettyPrint({
          chain: chain && `${chain?.name} (id: ${chain?.id})`,
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther2(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei2(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei2(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei2(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Request Arguments:",
            prettyArgs
          ].filter(Boolean),
          name: "TransactionExecutionError"
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.cause = cause;
      }
    };
    __name(TransactionExecutionError, "TransactionExecutionError");
    TransactionNotFoundError = class extends BaseError2 {
      constructor({ blockHash, blockNumber, blockTag, hash: hash3, index: index2 }) {
        let identifier = "Transaction";
        if (blockTag && index2 !== void 0)
          identifier = `Transaction at block time "${blockTag}" at index "${index2}"`;
        if (blockHash && index2 !== void 0)
          identifier = `Transaction at block hash "${blockHash}" at index "${index2}"`;
        if (blockNumber && index2 !== void 0)
          identifier = `Transaction at block number "${blockNumber}" at index "${index2}"`;
        if (hash3)
          identifier = `Transaction with hash "${hash3}"`;
        super(`${identifier} could not be found.`, {
          name: "TransactionNotFoundError"
        });
      }
    };
    __name(TransactionNotFoundError, "TransactionNotFoundError");
    TransactionReceiptNotFoundError = class extends BaseError2 {
      constructor({ hash: hash3 }) {
        super(`Transaction receipt with hash "${hash3}" could not be found. The Transaction may not be processed on a block yet.`, {
          name: "TransactionReceiptNotFoundError"
        });
      }
    };
    __name(TransactionReceiptNotFoundError, "TransactionReceiptNotFoundError");
    TransactionReceiptRevertedError = class extends BaseError2 {
      constructor({ receipt }) {
        super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
          metaMessages: [
            'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
            " ",
            "You can attempt to extract the revert reason by:",
            "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
            "- using the `call` Action with raw `data`"
          ],
          name: "TransactionReceiptRevertedError"
        });
        Object.defineProperty(this, "receipt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.receipt = receipt;
      }
    };
    __name(TransactionReceiptRevertedError, "TransactionReceiptRevertedError");
    WaitForTransactionReceiptTimeoutError = class extends BaseError2 {
      constructor({ hash: hash3 }) {
        super(`Timed out while waiting for transaction with hash "${hash3}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
      }
    };
    __name(WaitForTransactionReceiptTimeoutError, "WaitForTransactionReceiptTimeoutError");
  }
});

// node_modules/viem/_esm/errors/utils.js
function getAbortError(signal) {
  if (signal?.reason)
    return signal.reason;
  if (typeof DOMException === "function")
    return new DOMException("This operation was aborted", "AbortError");
  const error = new Error("This operation was aborted");
  error.name = "AbortError";
  return error;
}
function isAbortError(error) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
var getContractAddress, getUrl;
var init_utils3 = __esm({
  "node_modules/viem/_esm/errors/utils.js"() {
    getContractAddress = /* @__PURE__ */ __name((address) => address, "getContractAddress");
    __name(getAbortError, "getAbortError");
    __name(isAbortError, "isAbortError");
    getUrl = /* @__PURE__ */ __name((url) => {
      try {
        const parsed = new URL(url);
        if (!parsed.username && !parsed.password)
          return url;
        parsed.username = "";
        parsed.password = "";
        return parsed.toString();
      } catch {
        return url;
      }
    }, "getUrl");
  }
});

// node_modules/viem/_esm/errors/contract.js
var CallExecutionError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, CounterfactualDeploymentFailedError, RawContractError;
var init_contract = __esm({
  "node_modules/viem/_esm/errors/contract.js"() {
    init_parseAccount();
    init_solidity();
    init_decodeErrorResult();
    init_formatAbiItem2();
    init_formatAbiItemWithArgs();
    init_getAbiItem();
    init_formatEther();
    init_formatGwei();
    init_abi();
    init_base();
    init_stateOverride();
    init_transaction();
    init_utils3();
    CallExecutionError = class extends BaseError2 {
      constructor(cause, { account: account_, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
        const account = account_ ? parseAccount(account_) : void 0;
        let prettyArgs = prettyPrint({
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther2(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei2(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei2(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei2(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        if (stateOverride) {
          prettyArgs += `
${prettyStateOverride(stateOverride)}`;
        }
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Raw Call Arguments:",
            prettyArgs
          ].filter(Boolean),
          name: "CallExecutionError"
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.cause = cause;
      }
    };
    __name(CallExecutionError, "CallExecutionError");
    ContractFunctionExecutionError = class extends BaseError2 {
      constructor(cause, { abi: abi2, args, contractAddress, docsPath: docsPath8, functionName, sender }) {
        const abiItem = getAbiItem({ abi: abi2, args, name: functionName });
        const formattedArgs = abiItem ? formatAbiItemWithArgs({
          abiItem,
          args,
          includeFunctionName: false,
          includeName: false
        }) : void 0;
        const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
        const prettyArgs = prettyPrint({
          address: contractAddress && getContractAddress(contractAddress),
          function: functionWithParams,
          args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
          sender
        });
        super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            prettyArgs && "Contract Call:",
            prettyArgs
          ].filter(Boolean),
          name: "ContractFunctionExecutionError"
        });
        Object.defineProperty(this, "abi", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "args", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "contractAddress", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "formattedArgs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "functionName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "sender", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abi = abi2;
        this.args = args;
        this.cause = cause;
        this.contractAddress = contractAddress;
        this.functionName = functionName;
        this.sender = sender;
      }
    };
    __name(ContractFunctionExecutionError, "ContractFunctionExecutionError");
    ContractFunctionRevertedError = class extends BaseError2 {
      constructor({ abi: abi2, data, functionName, message, cause: error }) {
        let cause;
        let decodedData;
        let metaMessages;
        let reason;
        if (data && data !== "0x") {
          try {
            decodedData = decodeErrorResult({ abi: abi2, data, cause: error });
            const { abiItem, errorName, args: errorArgs } = decodedData;
            if (errorName === "Error") {
              reason = errorArgs[0];
            } else if (errorName === "Panic") {
              const [firstArg] = errorArgs;
              reason = panicReasons[firstArg];
            } else {
              const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
              const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
                abiItem,
                args: errorArgs,
                includeFunctionName: false,
                includeName: false
              }) : void 0;
              metaMessages = [
                errorWithParams ? `Error: ${errorWithParams}` : "",
                formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
              ];
            }
          } catch (err) {
            cause = err;
          }
        } else if (message)
          reason = message;
        let signature;
        if (cause instanceof AbiErrorSignatureNotFoundError) {
          signature = cause.signature;
          metaMessages = [
            `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
            "Make sure you are using the correct ABI and that the error exists on it.",
            `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
          ];
        }
        super(reason && reason !== "execution reverted" || signature ? [
          `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
          reason || signature
        ].join("\n") : `The contract function "${functionName}" reverted.`, {
          cause: cause ?? error,
          metaMessages,
          name: "ContractFunctionRevertedError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "raw", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "reason", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = decodedData;
        this.raw = data;
        this.reason = reason;
        this.signature = signature;
      }
    };
    __name(ContractFunctionRevertedError, "ContractFunctionRevertedError");
    ContractFunctionZeroDataError = class extends BaseError2 {
      constructor({ functionName, cause }) {
        super(`The contract function "${functionName}" returned no data ("0x").`, {
          metaMessages: [
            "This could be due to any of the following:",
            `  - The contract does not have the function "${functionName}",`,
            "  - The parameters passed to the contract function may be invalid, or",
            "  - The address is not a contract."
          ],
          name: "ContractFunctionZeroDataError",
          cause
        });
      }
    };
    __name(ContractFunctionZeroDataError, "ContractFunctionZeroDataError");
    CounterfactualDeploymentFailedError = class extends BaseError2 {
      constructor({ factory }) {
        super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
          metaMessages: [
            "Please ensure:",
            "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
            "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
          ],
          name: "CounterfactualDeploymentFailedError"
        });
      }
    };
    __name(CounterfactualDeploymentFailedError, "CounterfactualDeploymentFailedError");
    RawContractError = class extends BaseError2 {
      constructor({ data, message }) {
        super(message || "", { name: "RawContractError" });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 3
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
      }
    };
    __name(RawContractError, "RawContractError");
  }
});

// node_modules/viem/_esm/errors/request.js
var HttpRequestError, ResponseBodyTooLargeError, RpcRequestError, TimeoutError;
var init_request = __esm({
  "node_modules/viem/_esm/errors/request.js"() {
    init_stringify();
    init_base();
    init_utils3();
    HttpRequestError = class extends BaseError2 {
      constructor({ body, cause, details, headers, status, url }) {
        super("HTTP request failed.", {
          cause,
          details,
          metaMessages: [
            status && `Status: ${status}`,
            `URL: ${getUrl(url)}`,
            body && `Request body: ${stringify(body)}`
          ].filter(Boolean),
          name: "HttpRequestError"
        });
        Object.defineProperty(this, "body", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "headers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.url = url;
      }
    };
    __name(HttpRequestError, "HttpRequestError");
    ResponseBodyTooLargeError = class extends BaseError2 {
      constructor({ maxSize, size: size5 }) {
        super("HTTP response body exceeded the size limit.", {
          metaMessages: [`Max: ${maxSize} bytes`, `Received: ${size5} bytes`],
          name: "ResponseBodyTooLargeError"
        });
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = maxSize;
        this.size = size5;
      }
    };
    __name(ResponseBodyTooLargeError, "ResponseBodyTooLargeError");
    RpcRequestError = class extends BaseError2 {
      constructor({ body, error, url }) {
        super("RPC Request failed.", {
          cause: error,
          details: error.message,
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
          name: "RpcRequestError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.code = error.code;
        this.data = error.data;
        this.url = url;
      }
    };
    __name(RpcRequestError, "RpcRequestError");
    TimeoutError = class extends BaseError2 {
      constructor({ body, url }) {
        super("The request took too long to respond.", {
          details: "The request timed out.",
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
          name: "TimeoutError"
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.url = url;
      }
    };
    __name(TimeoutError, "TimeoutError");
  }
});

// node_modules/viem/_esm/errors/rpc.js
var unknownErrorCode, RpcError, ProviderRpcError, ParseRpcError, InvalidRequestRpcError, MethodNotFoundRpcError, InvalidParamsRpcError, InternalRpcError, InvalidInputRpcError, ResourceNotFoundRpcError, ResourceUnavailableRpcError, TransactionRejectedRpcError, MethodNotSupportedRpcError, LimitExceededRpcError, JsonRpcVersionUnsupportedError, UserRejectedRequestError, UnauthorizedProviderError, UnsupportedProviderMethodError, ProviderDisconnectedError, ChainDisconnectedError, SwitchChainError, UnsupportedNonOptionalCapabilityError, UnsupportedChainIdError, DuplicateIdError, UnknownBundleIdError, BundleTooLargeError, AtomicReadyWalletRejectedUpgradeError, AtomicityNotSupportedError, WalletConnectSessionSettlementError, UnknownRpcError;
var init_rpc = __esm({
  "node_modules/viem/_esm/errors/rpc.js"() {
    init_base();
    init_request();
    unknownErrorCode = -1;
    RpcError = class extends BaseError2 {
      constructor(cause, { code, docsPath: docsPath8, metaMessages, name, shortMessage }) {
        super(shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: metaMessages || cause?.metaMessages,
          name: name || "RpcError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = name || cause.name;
        this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
      }
    };
    __name(RpcError, "RpcError");
    ProviderRpcError = class extends RpcError {
      constructor(cause, options) {
        super(cause, options);
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = options.data;
      }
    };
    __name(ProviderRpcError, "ProviderRpcError");
    ParseRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: ParseRpcError.code,
          name: "ParseRpcError",
          shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
        });
      }
    };
    __name(ParseRpcError, "ParseRpcError");
    Object.defineProperty(ParseRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32700
    });
    InvalidRequestRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: InvalidRequestRpcError.code,
          name: "InvalidRequestRpcError",
          shortMessage: "JSON is not a valid request object."
        });
      }
    };
    __name(InvalidRequestRpcError, "InvalidRequestRpcError");
    Object.defineProperty(InvalidRequestRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32600
    });
    MethodNotFoundRpcError = class extends RpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: MethodNotFoundRpcError.code,
          name: "MethodNotFoundRpcError",
          shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
        });
      }
    };
    __name(MethodNotFoundRpcError, "MethodNotFoundRpcError");
    Object.defineProperty(MethodNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32601
    });
    InvalidParamsRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: InvalidParamsRpcError.code,
          name: "InvalidParamsRpcError",
          shortMessage: [
            "Invalid parameters were provided to the RPC method.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
      }
    };
    __name(InvalidParamsRpcError, "InvalidParamsRpcError");
    Object.defineProperty(InvalidParamsRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32602
    });
    InternalRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: InternalRpcError.code,
          name: "InternalRpcError",
          shortMessage: "An internal error was received."
        });
      }
    };
    __name(InternalRpcError, "InternalRpcError");
    Object.defineProperty(InternalRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32603
    });
    InvalidInputRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: InvalidInputRpcError.code,
          name: "InvalidInputRpcError",
          shortMessage: [
            "Missing or invalid parameters.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
      }
    };
    __name(InvalidInputRpcError, "InvalidInputRpcError");
    Object.defineProperty(InvalidInputRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32e3
    });
    ResourceNotFoundRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: ResourceNotFoundRpcError.code,
          name: "ResourceNotFoundRpcError",
          shortMessage: "Requested resource not found."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ResourceNotFoundRpcError"
        });
      }
    };
    __name(ResourceNotFoundRpcError, "ResourceNotFoundRpcError");
    Object.defineProperty(ResourceNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32001
    });
    ResourceUnavailableRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: ResourceUnavailableRpcError.code,
          name: "ResourceUnavailableRpcError",
          shortMessage: "Requested resource not available."
        });
      }
    };
    __name(ResourceUnavailableRpcError, "ResourceUnavailableRpcError");
    Object.defineProperty(ResourceUnavailableRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32002
    });
    TransactionRejectedRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: TransactionRejectedRpcError.code,
          name: "TransactionRejectedRpcError",
          shortMessage: "Transaction creation failed."
        });
      }
    };
    __name(TransactionRejectedRpcError, "TransactionRejectedRpcError");
    Object.defineProperty(TransactionRejectedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32003
    });
    MethodNotSupportedRpcError = class extends RpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: MethodNotSupportedRpcError.code,
          name: "MethodNotSupportedRpcError",
          shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
        });
      }
    };
    __name(MethodNotSupportedRpcError, "MethodNotSupportedRpcError");
    Object.defineProperty(MethodNotSupportedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32004
    });
    LimitExceededRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: LimitExceededRpcError.code,
          name: "LimitExceededRpcError",
          shortMessage: "Request exceeds defined limit."
        });
      }
    };
    __name(LimitExceededRpcError, "LimitExceededRpcError");
    Object.defineProperty(LimitExceededRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32005
    });
    JsonRpcVersionUnsupportedError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          code: JsonRpcVersionUnsupportedError.code,
          name: "JsonRpcVersionUnsupportedError",
          shortMessage: "Version of JSON-RPC protocol is not supported."
        });
      }
    };
    __name(JsonRpcVersionUnsupportedError, "JsonRpcVersionUnsupportedError");
    Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32006
    });
    UserRejectedRequestError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: UserRejectedRequestError.code,
          name: "UserRejectedRequestError",
          shortMessage: "User rejected the request."
        });
      }
    };
    __name(UserRejectedRequestError, "UserRejectedRequestError");
    Object.defineProperty(UserRejectedRequestError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4001
    });
    UnauthorizedProviderError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: UnauthorizedProviderError.code,
          name: "UnauthorizedProviderError",
          shortMessage: "The requested method and/or account has not been authorized by the user."
        });
      }
    };
    __name(UnauthorizedProviderError, "UnauthorizedProviderError");
    Object.defineProperty(UnauthorizedProviderError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4100
    });
    UnsupportedProviderMethodError = class extends ProviderRpcError {
      constructor(cause, { method } = {}) {
        super(cause, {
          code: UnsupportedProviderMethodError.code,
          name: "UnsupportedProviderMethodError",
          shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
        });
      }
    };
    __name(UnsupportedProviderMethodError, "UnsupportedProviderMethodError");
    Object.defineProperty(UnsupportedProviderMethodError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4200
    });
    ProviderDisconnectedError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: ProviderDisconnectedError.code,
          name: "ProviderDisconnectedError",
          shortMessage: "The Provider is disconnected from all chains."
        });
      }
    };
    __name(ProviderDisconnectedError, "ProviderDisconnectedError");
    Object.defineProperty(ProviderDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4900
    });
    ChainDisconnectedError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: ChainDisconnectedError.code,
          name: "ChainDisconnectedError",
          shortMessage: "The Provider is not connected to the requested chain."
        });
      }
    };
    __name(ChainDisconnectedError, "ChainDisconnectedError");
    Object.defineProperty(ChainDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4901
    });
    SwitchChainError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: SwitchChainError.code,
          name: "SwitchChainError",
          shortMessage: "An error occurred when attempting to switch chain."
        });
      }
    };
    __name(SwitchChainError, "SwitchChainError");
    Object.defineProperty(SwitchChainError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4902
    });
    UnsupportedNonOptionalCapabilityError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: UnsupportedNonOptionalCapabilityError.code,
          name: "UnsupportedNonOptionalCapabilityError",
          shortMessage: "This Wallet does not support a capability that was not marked as optional."
        });
      }
    };
    __name(UnsupportedNonOptionalCapabilityError, "UnsupportedNonOptionalCapabilityError");
    Object.defineProperty(UnsupportedNonOptionalCapabilityError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5700
    });
    UnsupportedChainIdError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: UnsupportedChainIdError.code,
          name: "UnsupportedChainIdError",
          shortMessage: "This Wallet does not support the requested chain ID."
        });
      }
    };
    __name(UnsupportedChainIdError, "UnsupportedChainIdError");
    Object.defineProperty(UnsupportedChainIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5710
    });
    DuplicateIdError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: DuplicateIdError.code,
          name: "DuplicateIdError",
          shortMessage: "There is already a bundle submitted with this ID."
        });
      }
    };
    __name(DuplicateIdError, "DuplicateIdError");
    Object.defineProperty(DuplicateIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5720
    });
    UnknownBundleIdError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: UnknownBundleIdError.code,
          name: "UnknownBundleIdError",
          shortMessage: "This bundle id is unknown / has not been submitted"
        });
      }
    };
    __name(UnknownBundleIdError, "UnknownBundleIdError");
    Object.defineProperty(UnknownBundleIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5730
    });
    BundleTooLargeError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: BundleTooLargeError.code,
          name: "BundleTooLargeError",
          shortMessage: "The call bundle is too large for the Wallet to process."
        });
      }
    };
    __name(BundleTooLargeError, "BundleTooLargeError");
    Object.defineProperty(BundleTooLargeError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5740
    });
    AtomicReadyWalletRejectedUpgradeError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: AtomicReadyWalletRejectedUpgradeError.code,
          name: "AtomicReadyWalletRejectedUpgradeError",
          shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade."
        });
      }
    };
    __name(AtomicReadyWalletRejectedUpgradeError, "AtomicReadyWalletRejectedUpgradeError");
    Object.defineProperty(AtomicReadyWalletRejectedUpgradeError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5750
    });
    AtomicityNotSupportedError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: AtomicityNotSupportedError.code,
          name: "AtomicityNotSupportedError",
          shortMessage: "The wallet does not support atomic execution but the request requires it."
        });
      }
    };
    __name(AtomicityNotSupportedError, "AtomicityNotSupportedError");
    Object.defineProperty(AtomicityNotSupportedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5760
    });
    WalletConnectSessionSettlementError = class extends ProviderRpcError {
      constructor(cause) {
        super(cause, {
          code: WalletConnectSessionSettlementError.code,
          name: "WalletConnectSessionSettlementError",
          shortMessage: "WalletConnect session settlement failed."
        });
      }
    };
    __name(WalletConnectSessionSettlementError, "WalletConnectSessionSettlementError");
    Object.defineProperty(WalletConnectSessionSettlementError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 7e3
    });
    UnknownRpcError = class extends RpcError {
      constructor(cause) {
        super(cause, {
          name: "UnknownRpcError",
          shortMessage: "An unknown RPC error occurred."
        });
      }
    };
    __name(UnknownRpcError, "UnknownRpcError");
  }
});

// node_modules/viem/_esm/utils/errors/getContractError.js
function getContractError(err, { abi: abi2, address, args, docsPath: docsPath8, functionName, sender }) {
  const error = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => typeof err2 === "object" && err2 !== null && "data" in err2) || err.walk() : {};
  const { code, data, details, message, shortMessage } = error;
  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName, cause: err });
    if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage) || code === InvalidInputRpcError.code && details === "execution reverted" && data) {
      return new ContractFunctionRevertedError({
        abi: abi2,
        data: typeof data === "object" ? data.data : data,
        functionName,
        message: error instanceof RpcRequestError ? details : shortMessage ?? message,
        cause: err
      });
    }
    return err;
  })();
  return new ContractFunctionExecutionError(cause, {
    abi: abi2,
    args,
    contractAddress: address,
    docsPath: docsPath8,
    functionName,
    sender
  });
}
var EXECUTION_REVERTED_ERROR_CODE;
var init_getContractError = __esm({
  "node_modules/viem/_esm/utils/errors/getContractError.js"() {
    init_abi();
    init_base();
    init_contract();
    init_request();
    init_rpc();
    EXECUTION_REVERTED_ERROR_CODE = 3;
    __name(getContractError, "getContractError");
  }
});

// node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}
var init_publicKeyToAddress = __esm({
  "node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js"() {
    init_getAddress();
    init_keccak256();
    __name(publicKeyToAddress, "publicKeyToAddress");
  }
});

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV;
var init_md = __esm({
  "node_modules/@noble/hashes/esm/_md.js"() {
    init_utils2();
    __name(setBigUint64, "setBigUint64");
    __name(Chi, "Chi");
    __name(Maj, "Maj");
    HashMD = class extends Hash {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { view, buffer: buffer2, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer2.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const { buffer: buffer2, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer2[pos++] = 128;
        clean(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer2[i] = 0;
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = createView(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer: buffer2, outputLen } = this;
        this.digestInto(buffer2);
        const res = buffer2.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer2);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    __name(HashMD, "HashMD");
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
  }
});

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K, SHA256_W, SHA256, sha256;
var init_sha2 = __esm({
  "node_modules/@noble/hashes/esm/sha2.js"() {
    init_md();
    init_utils2();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA256 = class extends HashMD {
      constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean(SHA256_W);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
      }
    };
    __name(SHA256, "SHA256");
    sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
  }
});

// node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/esm/hmac.js"() {
    init_utils2();
    HMAC = class extends Hash {
      constructor(hash3, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash3);
        const key = toBytes2(_key);
        this.iHash = hash3.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad4 = new Uint8Array(blockLen);
        pad4.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
        for (let i = 0; i < pad4.length; i++)
          pad4[i] ^= 54;
        this.iHash.update(pad4);
        this.oHash = hash3.create();
        for (let i = 0; i < pad4.length; i++)
          pad4[i] ^= 54 ^ 92;
        this.oHash.update(pad4);
        clean(pad4);
      }
      update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists(this);
        abytes(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    __name(HMAC, "HMAC");
    hmac = /* @__PURE__ */ __name((hash3, key, message) => new HMAC(hash3, key).update(message).digest(), "hmac");
    hmac.create = (hash3, key) => new HMAC(hash3, key);
  }
});

// node_modules/@noble/curves/esm/abstract/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function numberToHexUnpadded(num2) {
  const hex = num2.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
function bytesToHex2(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
function bytesToNumberLE(bytes) {
  abytes2(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad4 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad4);
    pad4 += a.length;
  }
  return res;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = /* @__PURE__ */ __name(() => {
    v.fill(1);
    k.fill(0);
    i = 0;
  }, "reset");
  const h = /* @__PURE__ */ __name((...b) => hmacFn(k, v, ...b), "h");
  const reseed = /* @__PURE__ */ __name((seed = u8n(0)) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  }, "reseed");
  const gen2 = /* @__PURE__ */ __name(() => {
    if (i++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  }, "gen");
  const genUntil = /* @__PURE__ */ __name((seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  }, "genUntil");
  return genUntil;
}
function validateObject(object, validators, optValidators = {}) {
  const checkField = /* @__PURE__ */ __name((fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  }, "checkField");
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n2, _1n2, hasHexBuiltin, hexes2, asciis, isPosBig, bitMask, u8n, u8fr, validatorFns;
var init_utils4 = __esm({
  "node_modules/@noble/curves/esm/abstract/utils.js"() {
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    __name(isBytes2, "isBytes");
    __name(abytes2, "abytes");
    __name(abool, "abool");
    __name(numberToHexUnpadded, "numberToHexUnpadded");
    __name(hexToNumber2, "hexToNumber");
    hasHexBuiltin = // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
    hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    __name(bytesToHex2, "bytesToHex");
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    __name(asciiToBase16, "asciiToBase16");
    __name(hexToBytes2, "hexToBytes");
    __name(bytesToNumberBE, "bytesToNumberBE");
    __name(bytesToNumberLE, "bytesToNumberLE");
    __name(numberToBytesBE, "numberToBytesBE");
    __name(numberToBytesLE, "numberToBytesLE");
    __name(ensureBytes, "ensureBytes");
    __name(concatBytes3, "concatBytes");
    __name(utf8ToBytes2, "utf8ToBytes");
    isPosBig = /* @__PURE__ */ __name((n) => typeof n === "bigint" && _0n2 <= n, "isPosBig");
    __name(inRange, "inRange");
    __name(aInRange, "aInRange");
    __name(bitLen, "bitLen");
    bitMask = /* @__PURE__ */ __name((n) => (_1n2 << BigInt(n)) - _1n2, "bitMask");
    u8n = /* @__PURE__ */ __name((len) => new Uint8Array(len), "u8n");
    u8fr = /* @__PURE__ */ __name((arr) => Uint8Array.from(arr), "u8fr");
    __name(createHmacDrbg, "createHmacDrbg");
    validatorFns = {
      bigint: (val) => typeof val === "bigint",
      function: (val) => typeof val === "function",
      boolean: (val) => typeof val === "boolean",
      string: (val) => typeof val === "string",
      stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
      isSafeInteger: (val) => Number.isSafeInteger(val),
      array: (val) => Array.isArray(val),
      field: (val, object) => object.Fp.isValid(val),
      hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
    };
    __name(validateObject, "validateObject");
    __name(memoized, "memoized");
  }
});

// node_modules/@noble/curves/esm/abstract/modular.js
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n3) / _4n;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n2);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n2), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
function tonelliShanks(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n3;
  let S = 0;
  while (Q % _2n2 === _0n3) {
    Q /= _2n2;
    S++;
  }
  let Z = _2n2;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n3) / _2n2;
  return /* @__PURE__ */ __name(function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n3 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  }, "tonelliSlow");
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(Fp, num2, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return Fp.ONE;
  if (power === _1n3)
    return num2;
  let p = Fp.ONE;
  let d = num2;
  while (power > _0n3) {
    if (power & _1n3)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n3;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num2);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num2) => mod(num2, ORDER),
    isValid: (num2) => {
      if (typeof num2 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num2);
      return _0n3 <= num2 && num2 < ORDER;
    },
    is0: (num2) => num2 === _0n3,
    isOdd: (num2) => (num2 & _1n3) === _1n3,
    neg: (num2) => mod(-num2, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num2) => mod(num2 * num2, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num2, power) => FpPow(f, num2, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num2) => num2 * num2,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num2) => invert(num2, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num2) => isLE2 ? numberToBytesLE(num2, BYTES) : numberToBytesBE(num2, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch(f, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n2, _3n, _4n, _5n, _8n, FIELD_FIELDS;
var init_modular = __esm({
  "node_modules/@noble/curves/esm/abstract/modular.js"() {
    init_utils2();
    init_utils4();
    _0n3 = BigInt(0);
    _1n3 = BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _8n = /* @__PURE__ */ BigInt(8);
    __name(mod, "mod");
    __name(pow2, "pow2");
    __name(invert, "invert");
    __name(sqrt3mod4, "sqrt3mod4");
    __name(sqrt5mod8, "sqrt5mod8");
    __name(tonelliShanks, "tonelliShanks");
    __name(FpSqrt, "FpSqrt");
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    __name(validateField, "validateField");
    __name(FpPow, "FpPow");
    __name(FpInvertBatch, "FpInvertBatch");
    __name(FpLegendre, "FpLegendre");
    __name(nLength, "nLength");
    __name(Field, "Field");
    __name(getFieldBytesLength, "getFieldBytesLength");
    __name(getMinHashLength, "getMinHashLength");
    __name(mapHashToField, "mapHashToField");
  }
});

// node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n4;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    // non-const time multiplication ladder
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param elm Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base2 = p;
      for (let window = 0; window < windows; window++) {
        base2 = p;
        points.push(base2);
        for (let i = 1; i < windowSize; i++) {
          base2 = base2.add(p);
          points.push(base2);
        }
        p = base2.double();
      }
      return points;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        if (n === _0n4)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
var init_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/curve.js"() {
    init_modular();
    init_utils4();
    _0n4 = BigInt(0);
    _1n4 = BigInt(1);
    __name(constTimeNegate, "constTimeNegate");
    __name(validateW, "validateW");
    __name(calcWOpts, "calcWOpts");
    __name(calcOffsets, "calcOffsets");
    __name(validateMSMPoints, "validateMSMPoints");
    __name(validateMSMScalars, "validateMSMScalars");
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
    __name(getW, "getW");
    __name(wNAF, "wNAF");
    __name(pippenger, "pippenger");
    __name(validateBasic, "validateBasic");
  }
});

// node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts(opts) {
  if (opts.lowS !== void 0)
    abool("lowS", opts.lowS);
  if (opts.prehash !== void 0)
    abool("prehash", opts.prehash);
}
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
function numToSizedHex(num2, size5) {
  return bytesToHex2(numberToBytesBE(num2, size5));
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes4 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes4 = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  __name(weierstrassEquation, "weierstrassEquation");
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  __name(isValidXY, "isValidXY");
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num2) {
    return inRange(num2, _1n5, CURVE.n);
  }
  __name(isWithinCurveOrder, "isWithinCurveOrder");
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num2;
    try {
      num2 = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num2 = mod(num2, N);
    aInRange("private key", num2, _1n5, N);
    return num2;
  }
  __name(normPrivateKeyToScalar, "normPrivateKeyToScalar");
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  __name(aprjpoint, "aprjpoint");
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  class Point2 {
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      const is0 = /* @__PURE__ */ __name((i) => Fp.eql(i, Fp.ZERO), "is0");
      if (is0(x) && is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(points) {
      const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(hex) {
      const P = Point2.fromAffine(fromBytes4(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    // Multiscalar Multiplication
    static msm(points, scalars) {
      return pippenger(Point2, Fn, points, scalars);
    }
    // "Private method", don't use it directly
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new Point2(this.px, Fp.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point2.normalizeZ);
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point2.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point2.normalizeZ([point, fake])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point2.BASE;
      const mul = /* @__PURE__ */ __name((P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2), "mul");
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? void 0 : sum;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes4(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  __name(Point2, "Point");
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point2,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN2(a) {
    return mod(a, CURVE_ORDER);
  }
  __name(modN2, "modN");
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  __name(invN, "invN");
  const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  __name(isBiggerThanHalfOrder, "isBiggerThanHalfOrder");
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
  }
  __name(normalizeS, "normalizeS");
  const slcNum = /* @__PURE__ */ __name((b, from16, to) => bytesToNumberBE(b.slice(from16, to)), "slcNum");
  class Signature {
    constructor(r, s, recovery) {
      aInRange("r", r, _1n5, CURVE_ORDER);
      aInRange("s", s, _1n5, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    /**
     * @todo remove
     * @deprecated
     */
    assertValidity() {
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point2.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN2(-h * ir);
      const u2 = modN2(s * ir);
      const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig(this);
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
    }
  }
  __name(Signature, "Signature");
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(windowSize = 8, point = Point2.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  __name(getPublicKey, "getPublicKey");
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point2)
      return true;
    const arr = ensureBytes("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return void 0;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  __name(isProbPub, "isProbPub");
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point2.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  __name(getSharedSecret, "getSharedSecret");
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN2(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(nBitLength);
  function int2octets(num2) {
    aInRange("num < 2^" + nBitLength, num2, _0n5, ORDER_MASK);
    return numberToBytesBE(num2, nByteLength);
  }
  __name(int2octets, "int2octets");
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => k in opts))
      throw new Error("sign() legacy options not supported");
    const { hash: hash3, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash3(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = modN2(q.x);
      if (r === _0n5)
        return;
      const s = modN2(ik * modN2(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    __name(k2sig, "k2sig");
    return { seed, k2sig };
  }
  __name(prepSig, "prepSig");
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign2(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  __name(sign2, "sign");
  Point2.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format: format2 } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format2 !== void 0 && format2 !== "compact" && format2 !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex2 && !format2 && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = void 0;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format2 !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format2 !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point2.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN2(h * is);
    const u2 = modN2(r * is);
    const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN2(R.x);
    return v === r;
  }
  __name(verify, "verify");
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign: sign2,
    verify,
    ProjectivePoint: Point2,
    Signature,
    utils
  };
}
function SWUFpSqrtRatio(Fp, Z) {
  const q = Fp.ORDER;
  let l = _0n5;
  for (let o = q - _1n5; o % _2n3 === _0n5; o /= _2n3)
    l += _1n5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n3 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n3;
  const c2 = (q - _1n5) / _2n_pow_c1;
  const c3 = (c2 - _1n5) / _2n3;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp.pow(Z, c2);
  const c7 = Fp.pow(Z, (c2 + _1n5) / _2n3);
  let sqrtRatio = /* @__PURE__ */ __name((u, v) => {
    let tv1 = c6;
    let tv2 = Fp.pow(v, c4);
    let tv3 = Fp.sqr(tv2);
    tv3 = Fp.mul(tv3, v);
    let tv5 = Fp.mul(u, tv3);
    tv5 = Fp.pow(tv5, c3);
    tv5 = Fp.mul(tv5, tv2);
    tv2 = Fp.mul(tv5, v);
    tv3 = Fp.mul(tv5, u);
    let tv4 = Fp.mul(tv3, tv2);
    tv5 = Fp.pow(tv4, c5);
    let isQR = Fp.eql(tv5, Fp.ONE);
    tv2 = Fp.mul(tv3, c7);
    tv5 = Fp.mul(tv4, tv1);
    tv3 = Fp.cmov(tv2, tv3, isQR);
    tv4 = Fp.cmov(tv5, tv4, isQR);
    for (let i = c1; i > _1n5; i--) {
      let tv52 = i - _2n3;
      tv52 = _2n3 << tv52 - _1n5;
      let tvv5 = Fp.pow(tv4, tv52);
      const e1 = Fp.eql(tvv5, Fp.ONE);
      tv2 = Fp.mul(tv3, tv1);
      tv1 = Fp.mul(tv1, tv1);
      tvv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, e1);
      tv4 = Fp.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  }, "sqrtRatio");
  if (Fp.ORDER % _4n2 === _3n2) {
    const c12 = (Fp.ORDER - _3n2) / _4n2;
    const c22 = Fp.sqrt(Fp.neg(Z));
    sqrtRatio = /* @__PURE__ */ __name((u, v) => {
      let tv1 = Fp.sqr(v);
      const tv2 = Fp.mul(u, v);
      tv1 = Fp.mul(tv1, tv2);
      let y1 = Fp.pow(tv1, c12);
      y1 = Fp.mul(y1, tv2);
      const y2 = Fp.mul(y1, c22);
      const tv3 = Fp.mul(Fp.sqr(y1), v);
      const isQR = Fp.eql(tv3, u);
      let y = Fp.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    }, "sqrtRatio");
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  validateField(Fp);
  if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
  if (!Fp.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
    tv1 = Fp.sqr(u);
    tv1 = Fp.mul(tv1, opts.Z);
    tv2 = Fp.sqr(tv1);
    tv2 = Fp.add(tv2, tv1);
    tv3 = Fp.add(tv2, Fp.ONE);
    tv3 = Fp.mul(tv3, opts.B);
    tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
    tv4 = Fp.mul(tv4, opts.A);
    tv2 = Fp.sqr(tv3);
    tv6 = Fp.sqr(tv4);
    tv5 = Fp.mul(tv6, opts.A);
    tv2 = Fp.add(tv2, tv5);
    tv2 = Fp.mul(tv2, tv3);
    tv6 = Fp.mul(tv6, tv4);
    tv5 = Fp.mul(tv6, opts.B);
    tv2 = Fp.add(tv2, tv5);
    x = Fp.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = Fp.mul(tv1, u);
    y = Fp.mul(y, value);
    x = Fp.cmov(x, tv3, isValid);
    y = Fp.cmov(y, value, isValid);
    const e1 = Fp.isOdd(u) === Fp.isOdd(y);
    y = Fp.cmov(Fp.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
    x = Fp.mul(x, tv4_inv);
    return { x, y };
  };
}
var DERErr, DER, _0n5, _1n5, _2n3, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
    init_curve();
    init_modular();
    init_utils4();
    __name(validateSigVerOpts, "validateSigVerOpts");
    __name(validatePointOpts, "validatePointOpts");
    DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    __name(DERErr, "DERErr");
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = DER;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t = numberToHexUnpadded(tag);
          return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          let pos = 0;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num2) {
          const { Err: E } = DER;
          if (num2 < _0n5)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num2);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(hex) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = ensureBytes("signature", hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    __name(numToSizedHex, "numToSizedHex");
    _0n5 = BigInt(0);
    _1n5 = BigInt(1);
    _2n3 = BigInt(2);
    _3n2 = BigInt(3);
    _4n2 = BigInt(4);
    __name(weierstrassPoints, "weierstrassPoints");
    __name(validateOpts, "validateOpts");
    __name(weierstrass, "weierstrass");
    __name(SWUFpSqrtRatio, "SWUFpSqrtRatio");
    __name(mapToCurveSimpleSWU, "mapToCurveSimpleSWU");
  }
});

// node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash3) {
  return {
    hash: hash3,
    hmac: (key, ...msgs) => hmac(hash3, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create2 = /* @__PURE__ */ __name((hash3) => weierstrass({ ...curveDef, ...getHash(hash3) }), "create");
  return { ...create2(defHash), create: create2 };
}
var init_shortw_utils = __esm({
  "node_modules/@noble/curves/esm/_shortw_utils.js"() {
    init_hmac();
    init_utils2();
    init_weierstrass();
    __name(getHash, "getHash");
    __name(createCurve, "createCurve");
  }
});

// node_modules/@noble/curves/esm/abstract/hash-to-curve.js
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1; i <= ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p, k, m, hash: hash3, expand, DST: _DST } = options;
  abytes2(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash3);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash3);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0; i < count; i++) {
    const e = new Array(m);
    for (let j = 0; j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function isogenyMap(field, map) {
  const coeff = map.map((i) => Array.from(i).reverse());
  return (x, y) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x = field.mul(xn, xd_inv);
    y = field.mul(y, field.mul(yn, yd_inv));
    return { x, y };
  };
}
function createHasher2(Point2, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  function map(num2) {
    return Point2.fromAffine(mapToCurve(num2));
  }
  __name(map, "map");
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point2.ZERO))
      return Point2.ZERO;
    P.assertValidity();
    return P;
  }
  __name(clear, "clear");
  return {
    defaults,
    // Encodes byte string to elliptic curve.
    // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    hashToCurve(msg, options) {
      const u = hash_to_field(msg, 2, { ...defaults, DST: defaults.DST, ...options });
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    // Encodes byte string to elliptic curve.
    // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    encodeToCurve(msg, options) {
      const u = hash_to_field(msg, 1, { ...defaults, DST: defaults.encodeDST, ...options });
      return clear(map(u[0]));
    },
    // Same as encodeToCurve, but without hash
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    }
  };
}
var os2ip;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/hash-to-curve.js"() {
    init_modular();
    init_utils4();
    os2ip = bytesToNumberBE;
    __name(i2osp, "i2osp");
    __name(strxor, "strxor");
    __name(anum, "anum");
    __name(expand_message_xmd, "expand_message_xmd");
    __name(expand_message_xof, "expand_message_xof");
    __name(hash_to_field, "hash_to_field");
    __name(isogenyMap, "isogenyMap");
    __name(createHasher2, "createHasher");
  }
});

// node_modules/@noble/curves/esm/secp256k1.js
var secp256k1_exports = {};
__export(secp256k1_exports, {
  encodeToCurve: () => encodeToCurve,
  hashToCurve: () => hashToCurve,
  schnorr: () => schnorr,
  secp256k1: () => secp256k1,
  secp256k1_hasher: () => secp256k1_hasher
});
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes3(tagP, ...messages));
}
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  aInRange("x", x, _1n6, secp256k1P);
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n4 !== _0n6)
    y = modP(-y);
  const p = new Point(x, y, _1n6);
  p.assertValidity();
  return p;
}
function challenge(...args) {
  return modN(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(num(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n6, secp256k1P))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n6, secp256k1N))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var secp256k1P, secp256k1N, _0n6, _1n6, _2n4, divNearest, Fpk1, secp256k1, TAGGED_HASH_PREFIXES, pointToBytes, numTo32b, modP, modN, Point, GmulAdd, num, schnorr, isoMap, mapSWU, secp256k1_hasher, hashToCurve, encodeToCurve;
var init_secp256k1 = __esm({
  "node_modules/@noble/curves/esm/secp256k1.js"() {
    init_sha2();
    init_utils2();
    init_shortw_utils();
    init_hash_to_curve();
    init_modular();
    init_utils4();
    init_weierstrass();
    secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    _0n6 = BigInt(0);
    _1n6 = BigInt(1);
    _2n4 = BigInt(2);
    divNearest = /* @__PURE__ */ __name((a, b) => (a + b / _2n4) / b, "divNearest");
    __name(sqrtMod, "sqrtMod");
    Fpk1 = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
    secp256k1 = createCurve({
      a: _0n6,
      b: BigInt(7),
      Fp: Fpk1,
      n: secp256k1N,
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      h: BigInt(1),
      lowS: true,
      // Allow only low-S signatures by default in sign() and verify()
      endo: {
        // Endomorphism, see above
        beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
        splitScalar: (k) => {
          const n = secp256k1N;
          const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
          const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
          const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
          const b2 = a1;
          const POW_2_128 = BigInt("0x100000000000000000000000000000000");
          const c1 = divNearest(b2 * k, n);
          const c2 = divNearest(-b1 * k, n);
          let k1 = mod(k - c1 * a1 - c2 * a2, n);
          let k2 = mod(-c1 * b1 - c2 * b2, n);
          const k1neg = k1 > POW_2_128;
          const k2neg = k2 > POW_2_128;
          if (k1neg)
            k1 = n - k1;
          if (k2neg)
            k2 = n - k2;
          if (k1 > POW_2_128 || k2 > POW_2_128) {
            throw new Error("splitScalar: Endomorphism failed, k=" + k);
          }
          return { k1neg, k1, k2neg, k2 };
        }
      }
    }, sha256);
    TAGGED_HASH_PREFIXES = {};
    __name(taggedHash, "taggedHash");
    pointToBytes = /* @__PURE__ */ __name((point) => point.toRawBytes(true).slice(1), "pointToBytes");
    numTo32b = /* @__PURE__ */ __name((n) => numberToBytesBE(n, 32), "numTo32b");
    modP = /* @__PURE__ */ __name((x) => mod(x, secp256k1P), "modP");
    modN = /* @__PURE__ */ __name((x) => mod(x, secp256k1N), "modN");
    Point = /* @__PURE__ */ (() => secp256k1.ProjectivePoint)();
    GmulAdd = /* @__PURE__ */ __name((Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b), "GmulAdd");
    __name(schnorrGetExtPubKey, "schnorrGetExtPubKey");
    __name(lift_x, "lift_x");
    num = bytesToNumberBE;
    __name(challenge, "challenge");
    __name(schnorrGetPublicKey, "schnorrGetPublicKey");
    __name(schnorrSign, "schnorrSign");
    __name(schnorrVerify, "schnorrVerify");
    schnorr = /* @__PURE__ */ (() => ({
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      utils: {
        randomPrivateKey: secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE,
        bytesToNumberBE,
        taggedHash,
        mod
      }
    }))();
    isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
      // xNum
      [
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
        "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
        "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
      ],
      // xDen
      [
        "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
        "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ],
      // yNum
      [
        "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
        "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
        "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
        "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
      ],
      // yDen
      [
        "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
        "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
        "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ]
    ].map((i) => i.map((j) => BigInt(j)))))();
    mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
      A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
      B: BigInt("1771"),
      Z: Fpk1.create(BigInt("-11"))
    }))();
    secp256k1_hasher = /* @__PURE__ */ (() => createHasher2(secp256k1.ProjectivePoint, (scalars) => {
      const { x, y } = mapSWU(Fpk1.create(scalars[0]));
      return isoMap(x, y);
    }, {
      DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
      encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
      p: Fpk1.ORDER,
      m: 1,
      k: 128,
      expand: "xmd",
      hash: sha256
    }))();
    hashToCurve = /* @__PURE__ */ (() => secp256k1_hasher.hashToCurve)();
    encodeToCurve = /* @__PURE__ */ (() => secp256k1_hasher.encodeToCurve)();
  }
});

// node_modules/viem/_esm/utils/signature/recoverPublicKey.js
async function recoverPublicKey({ hash: hash3, signature }) {
  const hashHex = isHex(hash3) ? hash3 : toHex(hash3);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), secp256k1_exports));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r, s, v, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    if (size(signatureHex) !== 65)
      throw new Error("invalid signature length");
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}
var init_recoverPublicKey = __esm({
  "node_modules/viem/_esm/utils/signature/recoverPublicKey.js"() {
    init_isHex();
    init_size();
    init_fromHex();
    init_toHex();
    __name(recoverPublicKey, "recoverPublicKey");
    __name(toRecoveryBit, "toRecoveryBit");
  }
});

// node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash: hash3, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash3, signature }));
}
var init_recoverAddress = __esm({
  "node_modules/viem/_esm/utils/signature/recoverAddress.js"() {
    init_publicKeyToAddress();
    init_recoverPublicKey();
    __name(recoverAddress, "recoverAddress");
  }
});

// node_modules/viem/_esm/utils/encoding/toRlp.js
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode4 } of list) {
        encode4(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError2("Length is too large.");
}
var init_toRlp = __esm({
  "node_modules/viem/_esm/utils/encoding/toRlp.js"() {
    init_base();
    init_cursor2();
    init_toBytes();
    init_toHex();
    __name(toRlp, "toRlp");
    __name(getEncodable, "getEncodable");
    __name(getEncodableList, "getEncodableList");
    __name(getEncodableBytes, "getEncodableBytes");
    __name(getSizeOfLength, "getSizeOfLength");
  }
});

// node_modules/viem/_esm/utils/authorization/hashAuthorization.js
function hashAuthorization(parameters) {
  const { chainId, nonce, to } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const hash3 = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      address,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash3);
  return hash3;
}
var init_hashAuthorization = __esm({
  "node_modules/viem/_esm/utils/authorization/hashAuthorization.js"() {
    init_concat();
    init_toBytes();
    init_toHex();
    init_toRlp();
    init_keccak256();
    __name(hashAuthorization, "hashAuthorization");
  }
});

// node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js
async function recoverAuthorizationAddress(parameters) {
  const { authorization, signature } = parameters;
  return recoverAddress({
    hash: hashAuthorization(authorization),
    signature: signature ?? authorization
  });
}
var init_recoverAuthorizationAddress = __esm({
  "node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js"() {
    init_recoverAddress();
    init_hashAuthorization();
    __name(recoverAuthorizationAddress, "recoverAuthorizationAddress");
  }
});

// node_modules/viem/_esm/errors/estimateGas.js
var EstimateGasExecutionError;
var init_estimateGas = __esm({
  "node_modules/viem/_esm/errors/estimateGas.js"() {
    init_formatEther();
    init_formatGwei();
    init_base();
    init_transaction();
    EstimateGasExecutionError = class extends BaseError2 {
      constructor(cause, { account, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
        const prettyArgs = prettyPrint({
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther2(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei2(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei2(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei2(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Estimate Gas Arguments:",
            prettyArgs
          ].filter(Boolean),
          name: "EstimateGasExecutionError"
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.cause = cause;
      }
    };
    __name(EstimateGasExecutionError, "EstimateGasExecutionError");
  }
});

// node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError, UnknownNodeError;
var init_node = __esm({
  "node_modules/viem/_esm/errors/node.js"() {
    init_formatGwei();
    init_base();
    ExecutionRevertedError = class extends BaseError2 {
      constructor({ cause, message } = {}) {
        const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
        super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
          cause,
          name: "ExecutionRevertedError"
        });
      }
    };
    __name(ExecutionRevertedError, "ExecutionRevertedError");
    Object.defineProperty(ExecutionRevertedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
    Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /execution reverted|gas required exceeds allowance/
    });
    FeeCapTooHighError = class extends BaseError2 {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei2(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
          cause,
          name: "FeeCapTooHighError"
        });
      }
    };
    __name(FeeCapTooHighError, "FeeCapTooHighError");
    Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
    });
    FeeCapTooLowError = class extends BaseError2 {
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei2(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
          cause,
          name: "FeeCapTooLowError"
        });
      }
    };
    __name(FeeCapTooLowError, "FeeCapTooLowError");
    Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
    });
    NonceTooHighError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
      }
    };
    __name(NonceTooHighError, "NonceTooHighError");
    Object.defineProperty(NonceTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too high/
    });
    NonceTooLowError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super([
          `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
          "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
        ].join("\n"), { cause, name: "NonceTooLowError" });
      }
    };
    __name(NonceTooLowError, "NonceTooLowError");
    Object.defineProperty(NonceTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too low|transaction already imported|already known/
    });
    NonceMaxValueError = class extends BaseError2 {
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
      }
    };
    __name(NonceMaxValueError, "NonceMaxValueError");
    Object.defineProperty(NonceMaxValueError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce has max value/
    });
    InsufficientFundsError = class extends BaseError2 {
      constructor({ cause } = {}) {
        super([
          "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
        ].join("\n"), {
          cause,
          metaMessages: [
            "This error could arise when the account does not have enough funds to:",
            " - pay for the total gas fee,",
            " - pay for the value to send.",
            " ",
            "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
            " - `gas` is the amount of gas needed for transaction to execute,",
            " - `gas fee` is the gas fee,",
            " - `value` is the amount of ether to send to the recipient."
          ],
          name: "InsufficientFundsError"
        });
      }
    };
    __name(InsufficientFundsError, "InsufficientFundsError");
    Object.defineProperty(InsufficientFundsError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /insufficient funds|exceeds transaction sender account balance/
    });
    IntrinsicGasTooHighError = class extends BaseError2 {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
          cause,
          name: "IntrinsicGasTooHighError"
        });
      }
    };
    __name(IntrinsicGasTooHighError, "IntrinsicGasTooHighError");
    Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too high|gas limit reached/
    });
    IntrinsicGasTooLowError = class extends BaseError2 {
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
          cause,
          name: "IntrinsicGasTooLowError"
        });
      }
    };
    __name(IntrinsicGasTooLowError, "IntrinsicGasTooLowError");
    Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too low/
    });
    TransactionTypeNotSupportedError = class extends BaseError2 {
      constructor({ cause }) {
        super("The transaction type is not supported for this chain.", {
          cause,
          name: "TransactionTypeNotSupportedError"
        });
      }
    };
    __name(TransactionTypeNotSupportedError, "TransactionTypeNotSupportedError");
    Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /transaction type not valid/
    });
    TipAboveFeeCapError = class extends BaseError2 {
      constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
        super([
          `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei2(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei2(maxFeePerGas)} gwei` : ""}).`
        ].join("\n"), {
          cause,
          name: "TipAboveFeeCapError"
        });
      }
    };
    __name(TipAboveFeeCapError, "TipAboveFeeCapError");
    Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
    });
    UnknownNodeError = class extends BaseError2 {
      constructor({ cause }) {
        super(`An error occurred while executing: ${cause?.shortMessage}`, {
          cause,
          name: "UnknownNodeError"
        });
      }
    };
    __name(UnknownNodeError, "UnknownNodeError");
  }
});

// node_modules/viem/_esm/utils/errors/getNodeError.js
function getNodeError(err, args) {
  const message = (err.details || "").toLowerCase();
  const executionRevertedError = err instanceof BaseError2 ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
  if (executionRevertedError instanceof BaseError2)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details
    });
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details
    });
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce });
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce });
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err });
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err });
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas
    });
  return new UnknownNodeError({
    cause: err
  });
}
var init_getNodeError = __esm({
  "node_modules/viem/_esm/utils/errors/getNodeError.js"() {
    init_base();
    init_node();
    __name(getNodeError, "getNodeError");
  }
});

// node_modules/viem/_esm/utils/errors/getEstimateGasError.js
function getEstimateGasError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new EstimateGasExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
var init_getEstimateGasError = __esm({
  "node_modules/viem/_esm/utils/errors/getEstimateGasError.js"() {
    init_estimateGas();
    init_node();
    init_getNodeError();
    __name(getEstimateGasError, "getEstimateGasError");
  }
});

// node_modules/viem/_esm/utils/formatters/extract.js
function extract(value_, { format: format2 }) {
  if (!format2)
    return {};
  const value = {};
  function extract_(formatted2) {
    const keys = Object.keys(formatted2);
    for (const key of keys) {
      if (key in value_)
        value[key] = value_[key];
      if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
        extract_(formatted2[key]);
    }
  }
  __name(extract_, "extract_");
  const formatted = format2(value_ || {});
  extract_(formatted);
  return value;
}
var init_extract = __esm({
  "node_modules/viem/_esm/utils/formatters/extract.js"() {
    __name(extract, "extract");
  }
});

// node_modules/viem/_esm/utils/formatters/formatter.js
function defineFormatter(type, format2) {
  return ({ exclude, format: overrides }) => {
    return {
      exclude,
      format: (args, action) => {
        const formatted = format2(args, action);
        if (exclude) {
          for (const key of exclude) {
            delete formatted[key];
          }
        }
        return {
          ...formatted,
          ...overrides(args, action)
        };
      },
      type
    };
  };
}
var init_formatter = __esm({
  "node_modules/viem/_esm/utils/formatters/formatter.js"() {
    __name(defineFormatter, "defineFormatter");
  }
});

// node_modules/viem/_esm/utils/formatters/transactionRequest.js
function formatTransactionRequest(request, _) {
  const rpcRequest = {};
  if (typeof request.authorizationList !== "undefined")
    rpcRequest.authorizationList = formatAuthorizationList(request.authorizationList);
  if (typeof request.accessList !== "undefined")
    rpcRequest.accessList = request.accessList;
  if (typeof request.blobVersionedHashes !== "undefined")
    rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined") {
    if (typeof request.blobs[0] !== "string")
      rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
    else
      rpcRequest.blobs = request.blobs;
  }
  if (typeof request.data !== "undefined")
    rpcRequest.data = request.data;
  if (request.account)
    rpcRequest.from = request.account.address;
  if (typeof request.from !== "undefined")
    rpcRequest.from = request.from;
  if (typeof request.gas !== "undefined")
    rpcRequest.gas = numberToHex(request.gas);
  if (typeof request.gasPrice !== "undefined")
    rpcRequest.gasPrice = numberToHex(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    rpcRequest.nonce = numberToHex(request.nonce);
  if (typeof request.to !== "undefined")
    rpcRequest.to = request.to;
  if (typeof request.type !== "undefined")
    rpcRequest.type = rpcTransactionType[request.type];
  if (typeof request.value !== "undefined")
    rpcRequest.value = numberToHex(request.value);
  return rpcRequest;
}
function formatAuthorizationList(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    r: authorization.r ? numberToHex(BigInt(authorization.r)) : authorization.r,
    s: authorization.s ? numberToHex(BigInt(authorization.s)) : authorization.s,
    chainId: numberToHex(authorization.chainId),
    nonce: numberToHex(authorization.nonce),
    ...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
    ...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
  }));
}
var rpcTransactionType;
var init_transactionRequest = __esm({
  "node_modules/viem/_esm/utils/formatters/transactionRequest.js"() {
    init_toHex();
    rpcTransactionType = {
      legacy: "0x0",
      eip2930: "0x1",
      eip1559: "0x2",
      eip4844: "0x3",
      eip7702: "0x4"
    };
    __name(formatTransactionRequest, "formatTransactionRequest");
    __name(formatAuthorizationList, "formatAuthorizationList");
  }
});

// node_modules/viem/_esm/utils/stateOverride.js
function serializeStateMapping(stateMapping) {
  if (!stateMapping || stateMapping.length === 0)
    return void 0;
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: "hex"
      });
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: "hex"
      });
    acc[slot] = value;
    return acc;
  }, {});
}
function serializeAccountStateOverride(parameters) {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride = {};
  if (code !== void 0)
    rpcAccountStateOverride.code = code;
  if (balance !== void 0)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== void 0)
    rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== void 0)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== void 0) {
    if (rpcAccountStateOverride.state)
      throw new StateAssignmentConflictError();
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}
function serializeStateOverride(parameters) {
  if (!parameters)
    return void 0;
  const rpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
var init_stateOverride2 = __esm({
  "node_modules/viem/_esm/utils/stateOverride.js"() {
    init_address();
    init_data();
    init_stateOverride();
    init_isAddress();
    init_toHex();
    __name(serializeStateMapping, "serializeStateMapping");
    __name(serializeAccountStateOverride, "serializeAccountStateOverride");
    __name(serializeStateOverride, "serializeStateOverride");
  }
});

// node_modules/viem/_esm/constants/number.js
var maxInt8, maxInt16, maxInt24, maxInt32, maxInt40, maxInt48, maxInt56, maxInt64, maxInt72, maxInt80, maxInt88, maxInt96, maxInt104, maxInt112, maxInt120, maxInt128, maxInt136, maxInt144, maxInt152, maxInt160, maxInt168, maxInt176, maxInt184, maxInt192, maxInt200, maxInt208, maxInt216, maxInt224, maxInt232, maxInt240, maxInt248, maxInt256, minInt8, minInt16, minInt24, minInt32, minInt40, minInt48, minInt56, minInt64, minInt72, minInt80, minInt88, minInt96, minInt104, minInt112, minInt120, minInt128, minInt136, minInt144, minInt152, minInt160, minInt168, minInt176, minInt184, minInt192, minInt200, minInt208, minInt216, minInt224, minInt232, minInt240, minInt248, minInt256, maxUint8, maxUint16, maxUint24, maxUint32, maxUint40, maxUint48, maxUint56, maxUint64, maxUint72, maxUint80, maxUint88, maxUint96, maxUint104, maxUint112, maxUint120, maxUint128, maxUint136, maxUint144, maxUint152, maxUint160, maxUint168, maxUint176, maxUint184, maxUint192, maxUint200, maxUint208, maxUint216, maxUint224, maxUint232, maxUint240, maxUint248, maxUint256;
var init_number = __esm({
  "node_modules/viem/_esm/constants/number.js"() {
    maxInt8 = 2n ** (8n - 1n) - 1n;
    maxInt16 = 2n ** (16n - 1n) - 1n;
    maxInt24 = 2n ** (24n - 1n) - 1n;
    maxInt32 = 2n ** (32n - 1n) - 1n;
    maxInt40 = 2n ** (40n - 1n) - 1n;
    maxInt48 = 2n ** (48n - 1n) - 1n;
    maxInt56 = 2n ** (56n - 1n) - 1n;
    maxInt64 = 2n ** (64n - 1n) - 1n;
    maxInt72 = 2n ** (72n - 1n) - 1n;
    maxInt80 = 2n ** (80n - 1n) - 1n;
    maxInt88 = 2n ** (88n - 1n) - 1n;
    maxInt96 = 2n ** (96n - 1n) - 1n;
    maxInt104 = 2n ** (104n - 1n) - 1n;
    maxInt112 = 2n ** (112n - 1n) - 1n;
    maxInt120 = 2n ** (120n - 1n) - 1n;
    maxInt128 = 2n ** (128n - 1n) - 1n;
    maxInt136 = 2n ** (136n - 1n) - 1n;
    maxInt144 = 2n ** (144n - 1n) - 1n;
    maxInt152 = 2n ** (152n - 1n) - 1n;
    maxInt160 = 2n ** (160n - 1n) - 1n;
    maxInt168 = 2n ** (168n - 1n) - 1n;
    maxInt176 = 2n ** (176n - 1n) - 1n;
    maxInt184 = 2n ** (184n - 1n) - 1n;
    maxInt192 = 2n ** (192n - 1n) - 1n;
    maxInt200 = 2n ** (200n - 1n) - 1n;
    maxInt208 = 2n ** (208n - 1n) - 1n;
    maxInt216 = 2n ** (216n - 1n) - 1n;
    maxInt224 = 2n ** (224n - 1n) - 1n;
    maxInt232 = 2n ** (232n - 1n) - 1n;
    maxInt240 = 2n ** (240n - 1n) - 1n;
    maxInt248 = 2n ** (248n - 1n) - 1n;
    maxInt256 = 2n ** (256n - 1n) - 1n;
    minInt8 = -(2n ** (8n - 1n));
    minInt16 = -(2n ** (16n - 1n));
    minInt24 = -(2n ** (24n - 1n));
    minInt32 = -(2n ** (32n - 1n));
    minInt40 = -(2n ** (40n - 1n));
    minInt48 = -(2n ** (48n - 1n));
    minInt56 = -(2n ** (56n - 1n));
    minInt64 = -(2n ** (64n - 1n));
    minInt72 = -(2n ** (72n - 1n));
    minInt80 = -(2n ** (80n - 1n));
    minInt88 = -(2n ** (88n - 1n));
    minInt96 = -(2n ** (96n - 1n));
    minInt104 = -(2n ** (104n - 1n));
    minInt112 = -(2n ** (112n - 1n));
    minInt120 = -(2n ** (120n - 1n));
    minInt128 = -(2n ** (128n - 1n));
    minInt136 = -(2n ** (136n - 1n));
    minInt144 = -(2n ** (144n - 1n));
    minInt152 = -(2n ** (152n - 1n));
    minInt160 = -(2n ** (160n - 1n));
    minInt168 = -(2n ** (168n - 1n));
    minInt176 = -(2n ** (176n - 1n));
    minInt184 = -(2n ** (184n - 1n));
    minInt192 = -(2n ** (192n - 1n));
    minInt200 = -(2n ** (200n - 1n));
    minInt208 = -(2n ** (208n - 1n));
    minInt216 = -(2n ** (216n - 1n));
    minInt224 = -(2n ** (224n - 1n));
    minInt232 = -(2n ** (232n - 1n));
    minInt240 = -(2n ** (240n - 1n));
    minInt248 = -(2n ** (248n - 1n));
    minInt256 = -(2n ** (256n - 1n));
    maxUint8 = 2n ** 8n - 1n;
    maxUint16 = 2n ** 16n - 1n;
    maxUint24 = 2n ** 24n - 1n;
    maxUint32 = 2n ** 32n - 1n;
    maxUint40 = 2n ** 40n - 1n;
    maxUint48 = 2n ** 48n - 1n;
    maxUint56 = 2n ** 56n - 1n;
    maxUint64 = 2n ** 64n - 1n;
    maxUint72 = 2n ** 72n - 1n;
    maxUint80 = 2n ** 80n - 1n;
    maxUint88 = 2n ** 88n - 1n;
    maxUint96 = 2n ** 96n - 1n;
    maxUint104 = 2n ** 104n - 1n;
    maxUint112 = 2n ** 112n - 1n;
    maxUint120 = 2n ** 120n - 1n;
    maxUint128 = 2n ** 128n - 1n;
    maxUint136 = 2n ** 136n - 1n;
    maxUint144 = 2n ** 144n - 1n;
    maxUint152 = 2n ** 152n - 1n;
    maxUint160 = 2n ** 160n - 1n;
    maxUint168 = 2n ** 168n - 1n;
    maxUint176 = 2n ** 176n - 1n;
    maxUint184 = 2n ** 184n - 1n;
    maxUint192 = 2n ** 192n - 1n;
    maxUint200 = 2n ** 200n - 1n;
    maxUint208 = 2n ** 208n - 1n;
    maxUint216 = 2n ** 216n - 1n;
    maxUint224 = 2n ** 224n - 1n;
    maxUint232 = 2n ** 232n - 1n;
    maxUint240 = 2n ** 240n - 1n;
    maxUint248 = 2n ** 248n - 1n;
    maxUint256 = 2n ** 256n - 1n;
  }
});

// node_modules/viem/_esm/utils/transaction/assertRequest.js
function assertRequest(args) {
  const { account: account_, maxFeePerGas, maxPriorityFeePerGas, to } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
var init_assertRequest = __esm({
  "node_modules/viem/_esm/utils/transaction/assertRequest.js"() {
    init_parseAccount();
    init_number();
    init_address();
    init_node();
    init_isAddress();
    __name(assertRequest, "assertRequest");
  }
});

// node_modules/viem/_esm/errors/fee.js
var BaseFeeScalarError, Eip1559FeesNotSupportedError, MaxFeePerGasTooLowError;
var init_fee = __esm({
  "node_modules/viem/_esm/errors/fee.js"() {
    init_formatGwei();
    init_base();
    BaseFeeScalarError = class extends BaseError2 {
      constructor() {
        super("`baseFeeMultiplier` must be greater than 1.", {
          name: "BaseFeeScalarError"
        });
      }
    };
    __name(BaseFeeScalarError, "BaseFeeScalarError");
    Eip1559FeesNotSupportedError = class extends BaseError2 {
      constructor() {
        super("Chain does not support EIP-1559 fees.", {
          name: "Eip1559FeesNotSupportedError"
        });
      }
    };
    __name(Eip1559FeesNotSupportedError, "Eip1559FeesNotSupportedError");
    MaxFeePerGasTooLowError = class extends BaseError2 {
      constructor({ maxPriorityFeePerGas }) {
        super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei2(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
      }
    };
    __name(MaxFeePerGasTooLowError, "MaxFeePerGasTooLowError");
  }
});

// node_modules/viem/_esm/errors/block.js
var BlockNotFoundError;
var init_block = __esm({
  "node_modules/viem/_esm/errors/block.js"() {
    init_base();
    BlockNotFoundError = class extends BaseError2 {
      constructor({ blockHash, blockNumber }) {
        let identifier = "Block";
        if (blockHash)
          identifier = `Block at hash "${blockHash}"`;
        if (blockNumber)
          identifier = `Block at number "${blockNumber}"`;
        super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
      }
    };
    __name(BlockNotFoundError, "BlockNotFoundError");
  }
});

// node_modules/viem/_esm/utils/formatters/transaction.js
function formatTransaction(transaction, _) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
    ...transaction.blockTimestamp != null && {
      blockTimestamp: BigInt(transaction.blockTimestamp)
    },
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : void 0,
    gas: transaction.gas ? BigInt(transaction.gas) : void 0,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : void 0,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : void 0,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : void 0,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : void 0,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : void 0,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
    type: transaction.type ? transactionType[transaction.type] : void 0,
    typeHex: transaction.type ? transaction.type : void 0,
    value: transaction.value ? BigInt(transaction.value) : void 0,
    v: transaction.v ? BigInt(transaction.v) : void 0
  };
  if (transaction.authorizationList)
    transaction_.authorizationList = formatAuthorizationList2(transaction.authorizationList);
  transaction_.yParity = (() => {
    if (transaction.yParity)
      return Number(transaction.yParity);
    if (typeof transaction_.v === "bigint") {
      if (transaction_.v === 0n || transaction_.v === 27n)
        return 0;
      if (transaction_.v === 1n || transaction_.v === 28n)
        return 1;
      if (transaction_.v >= 35n)
        return transaction_.v % 2n === 0n ? 1 : 0;
    }
    return void 0;
  })();
  if (transaction_.type === "legacy") {
    delete transaction_.accessList;
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
    delete transaction_.yParity;
  }
  if (transaction_.type === "eip2930") {
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
  }
  if (transaction_.type === "eip1559")
    delete transaction_.maxFeePerBlobGas;
  return transaction_;
}
function formatAuthorizationList2(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    chainId: Number(authorization.chainId),
    nonce: Number(authorization.nonce),
    r: authorization.r,
    s: authorization.s,
    yParity: Number(authorization.yParity)
  }));
}
var transactionType, defineTransaction;
var init_transaction2 = __esm({
  "node_modules/viem/_esm/utils/formatters/transaction.js"() {
    init_fromHex();
    init_formatter();
    transactionType = {
      "0x0": "legacy",
      "0x1": "eip2930",
      "0x2": "eip1559",
      "0x3": "eip4844",
      "0x4": "eip7702"
    };
    __name(formatTransaction, "formatTransaction");
    defineTransaction = /* @__PURE__ */ defineFormatter("transaction", formatTransaction);
    __name(formatAuthorizationList2, "formatAuthorizationList");
  }
});

// node_modules/viem/_esm/utils/formatters/block.js
function formatBlock(block, _) {
  const transactions = (block.transactions ?? []).map((transaction) => {
    if (typeof transaction === "string")
      return transaction;
    return formatTransaction(transaction);
  });
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : void 0,
    difficulty: block.difficulty ? BigInt(block.difficulty) : void 0,
    excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : void 0,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : void 0,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : void 0,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : void 0,
    timestamp: block.timestamp ? BigInt(block.timestamp) : void 0,
    transactions,
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
  };
}
var defineBlock;
var init_block2 = __esm({
  "node_modules/viem/_esm/utils/formatters/block.js"() {
    init_formatter();
    init_transaction2();
    __name(formatBlock, "formatBlock");
    defineBlock = /* @__PURE__ */ defineFormatter("block", formatBlock);
  }
});

// node_modules/viem/_esm/actions/public/getBlock.js
async function getBlock(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", includeTransactions: includeTransactions_ } = {}) {
  const includeTransactions = includeTransactions_ ?? false;
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let block = null;
  if (blockHash) {
    block = await client.request({
      method: "eth_getBlockByHash",
      params: [blockHash, includeTransactions]
    }, { dedupe: true });
  } else {
    block = await client.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberHex || blockTag, includeTransactions]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!block)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format2 = client.chain?.formatters?.block?.format || formatBlock;
  return format2(block, "getBlock");
}
var init_getBlock = __esm({
  "node_modules/viem/_esm/actions/public/getBlock.js"() {
    init_block();
    init_toHex();
    init_block2();
    __name(getBlock, "getBlock");
  }
});

// node_modules/viem/_esm/actions/public/getGasPrice.js
async function getGasPrice(client) {
  const gasPrice = await client.request({
    method: "eth_gasPrice"
  });
  return BigInt(gasPrice);
}
var init_getGasPrice = __esm({
  "node_modules/viem/_esm/actions/public/getGasPrice.js"() {
    __name(getGasPrice, "getGasPrice");
  }
});

// node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
async function estimateMaxPriorityFeePerGas(client, args) {
  return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
  const { block: block_, chain = client.chain, request } = args || {};
  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
    if (typeof maxPriorityFeePerGas === "function") {
      const block = block_ || await getAction(client, getBlock, "getBlock")({});
      const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
        block,
        client,
        request
      });
      if (maxPriorityFeePerGas_ === null)
        throw new Error();
      return maxPriorityFeePerGas_;
    }
    if (typeof maxPriorityFeePerGas !== "undefined")
      return maxPriorityFeePerGas;
    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas"
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({})
    ]);
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
    if (maxPriorityFeePerGas < 0n)
      return 0n;
    return maxPriorityFeePerGas;
  }
}
var init_estimateMaxPriorityFeePerGas = __esm({
  "node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js"() {
    init_fee();
    init_fromHex();
    init_getAction();
    init_getBlock();
    init_getGasPrice();
    __name(estimateMaxPriorityFeePerGas, "estimateMaxPriorityFeePerGas");
    __name(internal_estimateMaxPriorityFeePerGas, "internal_estimateMaxPriorityFeePerGas");
  }
});

// node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
async function estimateFeesPerGas(client, args) {
  return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_,
        client,
        request
      });
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1)
    throw new BaseFeeScalarError();
  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = /* @__PURE__ */ __name((base2) => base2 * BigInt(Math.round(baseFeeMultiplier * denominator)) / BigInt(denominator), "multiply");
  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block_,
      client,
      multiply,
      request,
      type
    });
    if (fees !== null)
      return fees;
  }
  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
      block,
      chain,
      request
    });
    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice
  };
}
var init_estimateFeesPerGas = __esm({
  "node_modules/viem/_esm/actions/public/estimateFeesPerGas.js"() {
    init_fee();
    init_getAction();
    init_estimateMaxPriorityFeePerGas();
    init_getBlock();
    init_getGasPrice();
    __name(estimateFeesPerGas, "estimateFeesPerGas");
    __name(internal_estimateFeesPerGas, "internal_estimateFeesPerGas");
  }
});

// node_modules/viem/_esm/utils/block/formatBlockParameter.js
function formatBlockParameter(parameters) {
  const { blockHash, blockNumber, blockTag, requireCanonical } = parameters;
  if (requireCanonical !== void 0 && !blockHash)
    throw new BaseError2("`requireCanonical` can only be provided when `blockHash` is set.");
  if (blockHash)
    return requireCanonical ? { blockHash, requireCanonical } : { blockHash };
  if (typeof blockNumber === "bigint")
    return numberToHex(blockNumber);
  return blockTag ?? "latest";
}
var init_formatBlockParameter = __esm({
  "node_modules/viem/_esm/utils/block/formatBlockParameter.js"() {
    init_base();
    init_toHex();
    __name(formatBlockParameter, "formatBlockParameter");
  }
});

// node_modules/viem/_esm/actions/public/getTransactionCount.js
async function getTransactionCount(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const count = await client.request({
    method: "eth_getTransactionCount",
    params: [address, block]
  }, {
    dedupe: typeof blockNumber === "bigint" || blockHash !== void 0
  });
  return hexToNumber(count);
}
var init_getTransactionCount = __esm({
  "node_modules/viem/_esm/actions/public/getTransactionCount.js"() {
    init_formatBlockParameter();
    init_fromHex();
    __name(getTransactionCount, "getTransactionCount");
  }
});

// node_modules/viem/_esm/utils/blob/blobsToCommitments.js
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}
var init_blobsToCommitments = __esm({
  "node_modules/viem/_esm/utils/blob/blobsToCommitments.js"() {
    init_toBytes();
    init_toHex();
    __name(blobsToCommitments, "blobsToCommitments");
  }
});

// node_modules/viem/_esm/utils/blob/blobsToProofs.js
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}
var init_blobsToProofs = __esm({
  "node_modules/viem/_esm/utils/blob/blobsToProofs.js"() {
    init_toBytes();
    init_toHex();
    __name(blobsToProofs, "blobsToProofs");
  }
});

// node_modules/@noble/hashes/esm/sha256.js
var sha2562;
var init_sha256 = __esm({
  "node_modules/@noble/hashes/esm/sha256.js"() {
    init_sha2();
    sha2562 = sha256;
  }
});

// node_modules/viem/_esm/utils/hash/sha256.js
function sha2563(value, to_) {
  const to = to_ || "hex";
  const bytes = sha2562(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_sha2562 = __esm({
  "node_modules/viem/_esm/utils/hash/sha256.js"() {
    init_sha256();
    init_isHex();
    init_toBytes();
    init_toHex();
    __name(sha2563, "sha256");
  }
});

// node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version4 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2563(commitment, "bytes");
  versionedHash.set([version4], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}
var init_commitmentToVersionedHash = __esm({
  "node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js"() {
    init_toHex();
    init_sha2562();
    __name(commitmentToVersionedHash, "commitmentToVersionedHash");
  }
});

// node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version4 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version4
    }));
  }
  return hashes;
}
var init_commitmentsToVersionedHashes = __esm({
  "node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js"() {
    init_commitmentToVersionedHash();
    __name(commitmentsToVersionedHashes, "commitmentsToVersionedHashes");
  }
});

// node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction, bytesPerFieldElement, fieldElementsPerBlob, bytesPerBlob, maxBytesPerTransaction;
var init_blob = __esm({
  "node_modules/viem/_esm/constants/blob.js"() {
    blobsPerTransaction = 6;
    bytesPerFieldElement = 32;
    fieldElementsPerBlob = 4096;
    bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
    maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
    1 - // zero byte (0x00) appended to each field element.
    1 * fieldElementsPerBlob * blobsPerTransaction;
  }
});

// node_modules/viem/_esm/constants/kzg.js
var versionedHashVersionKzg;
var init_kzg = __esm({
  "node_modules/viem/_esm/constants/kzg.js"() {
    versionedHashVersionKzg = 1;
  }
});

// node_modules/viem/_esm/errors/blob.js
var BlobSizeTooLargeError, EmptyBlobError, InvalidVersionedHashSizeError, InvalidVersionedHashVersionError;
var init_blob2 = __esm({
  "node_modules/viem/_esm/errors/blob.js"() {
    init_kzg();
    init_base();
    BlobSizeTooLargeError = class extends BaseError2 {
      constructor({ maxSize, size: size5 }) {
        super("Blob size is too large.", {
          metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size5} bytes`],
          name: "BlobSizeTooLargeError"
        });
      }
    };
    __name(BlobSizeTooLargeError, "BlobSizeTooLargeError");
    EmptyBlobError = class extends BaseError2 {
      constructor() {
        super("Blob data must not be empty.", { name: "EmptyBlobError" });
      }
    };
    __name(EmptyBlobError, "EmptyBlobError");
    InvalidVersionedHashSizeError = class extends BaseError2 {
      constructor({ hash: hash3, size: size5 }) {
        super(`Versioned hash "${hash3}" size is invalid.`, {
          metaMessages: ["Expected: 32", `Received: ${size5}`],
          name: "InvalidVersionedHashSizeError"
        });
      }
    };
    __name(InvalidVersionedHashSizeError, "InvalidVersionedHashSizeError");
    InvalidVersionedHashVersionError = class extends BaseError2 {
      constructor({ hash: hash3, version: version4 }) {
        super(`Versioned hash "${hash3}" version is invalid.`, {
          metaMessages: [
            `Expected: ${versionedHashVersionKzg}`,
            `Received: ${version4}`
          ],
          name: "InvalidVersionedHashVersionError"
        });
      }
    };
    __name(InvalidVersionedHashVersionError, "InvalidVersionedHashVersionError");
  }
});

// node_modules/viem/_esm/utils/blob/toBlobs.js
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError();
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size5 = 0;
    while (size5 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size5++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}
var init_toBlobs = __esm({
  "node_modules/viem/_esm/utils/blob/toBlobs.js"() {
    init_blob();
    init_blob2();
    init_cursor2();
    init_size();
    init_toBytes();
    init_toHex();
    __name(toBlobs, "toBlobs");
  }
});

// node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0; i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}
var init_toBlobSidecars = __esm({
  "node_modules/viem/_esm/utils/blob/toBlobSidecars.js"() {
    init_blobsToCommitments();
    init_blobsToProofs();
    init_toBlobs();
    __name(toBlobSidecars, "toBlobSidecars");
  }
});

// node_modules/viem/_esm/utils/transaction/getTransactionType.js
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}
var init_getTransactionType = __esm({
  "node_modules/viem/_esm/utils/transaction/getTransactionType.js"() {
    init_transaction();
    __name(getTransactionType, "getTransactionType");
  }
});

// node_modules/viem/_esm/utils/errors/getTransactionError.js
function getTransactionError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new TransactionExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
var init_getTransactionError = __esm({
  "node_modules/viem/_esm/utils/errors/getTransactionError.js"() {
    init_node();
    init_transaction();
    init_getNodeError();
    __name(getTransactionError, "getTransactionError");
  }
});

// node_modules/viem/_esm/actions/public/getChainId.js
async function getChainId(client) {
  const chainIdHex = await client.request({
    method: "eth_chainId"
  }, { dedupe: true });
  return hexToNumber(chainIdHex);
}
var init_getChainId = __esm({
  "node_modules/viem/_esm/actions/public/getChainId.js"() {
    init_fromHex();
    __name(getChainId, "getChainId");
  }
});

// node_modules/viem/_esm/actions/public/fillTransaction.js
async function fillTransaction(client, parameters) {
  const { account = client.account, accessList, authorizationList, chain = client.chain, blobVersionedHashes, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce: nonce_, nonceManager, to, type, value, ...rest } = parameters;
  const nonce = await (async () => {
    if (!account)
      return nonce_;
    if (!nonceManager)
      return nonce_;
    if (typeof nonce_ !== "undefined")
      return nonce_;
    const account_ = parseAccount(account);
    const chainId = chain ? chain.id : await getAction(client, getChainId, "getChainId")({});
    return await nonceManager.consume({
      address: account_.address,
      chainId,
      client
    });
  })();
  assertRequest(parameters);
  const chainFormat = chain?.formatters?.transactionRequest?.format;
  const format2 = chainFormat || formatTransactionRequest;
  const request = format2({
    // Pick out extra data that might exist on the chain's transaction request type.
    ...extract(rest, { format: chainFormat }),
    account: account ? parseAccount(account) : void 0,
    accessList,
    authorizationList,
    blobs,
    blobVersionedHashes,
    data,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    type,
    value
  }, "fillTransaction");
  try {
    const response = await client.request({
      method: "eth_fillTransaction",
      params: [request]
    });
    const format3 = chain?.formatters?.transaction?.format || formatTransaction;
    const transaction = format3(response.tx);
    delete transaction.blockHash;
    delete transaction.blockNumber;
    delete transaction.r;
    delete transaction.s;
    delete transaction.transactionIndex;
    delete transaction.v;
    delete transaction.yParity;
    transaction.data = transaction.input;
    const hasFeePayerSignature = typeof transaction.feePayerSignature !== "undefined" && transaction.feePayerSignature !== null;
    if (hasFeePayerSignature && typeof nonce !== "undefined" && transaction.nonce !== nonce)
      throw new FeePayerNonceMismatchError({
        filledNonce: transaction.nonce,
        requestedNonce: nonce
      });
    if (!hasFeePayerSignature) {
      if (transaction.gas)
        transaction.gas = parameters.gas ?? transaction.gas;
      if (transaction.gasPrice)
        transaction.gasPrice = parameters.gasPrice ?? transaction.gasPrice;
      if (transaction.maxFeePerBlobGas)
        transaction.maxFeePerBlobGas = parameters.maxFeePerBlobGas ?? transaction.maxFeePerBlobGas;
      if (transaction.maxFeePerGas)
        transaction.maxFeePerGas = parameters.maxFeePerGas ?? transaction.maxFeePerGas;
      if (transaction.maxPriorityFeePerGas)
        transaction.maxPriorityFeePerGas = parameters.maxPriorityFeePerGas ?? transaction.maxPriorityFeePerGas;
      if (typeof transaction.nonce !== "undefined")
        transaction.nonce = parameters.nonce ?? transaction.nonce;
      const feeMultiplier = await (async () => {
        if (typeof chain?.fees?.baseFeeMultiplier === "function") {
          const block = await getAction(client, getBlock, "getBlock")({});
          return chain.fees.baseFeeMultiplier({
            block,
            client,
            request: parameters
          });
        }
        return chain?.fees?.baseFeeMultiplier ?? 1.2;
      })();
      if (feeMultiplier < 1)
        throw new BaseFeeScalarError();
      const decimals = feeMultiplier.toString().split(".")[1]?.length ?? 0;
      const denominator = 10 ** decimals;
      const multiplyFee = /* @__PURE__ */ __name((base2) => base2 * BigInt(Math.round(feeMultiplier * denominator)) / BigInt(denominator), "multiplyFee");
      if (transaction.maxFeePerGas && !parameters.maxFeePerGas)
        transaction.maxFeePerGas = multiplyFee(transaction.maxFeePerGas);
      if (transaction.gasPrice && !parameters.gasPrice)
        transaction.gasPrice = multiplyFee(transaction.gasPrice);
    }
    return {
      raw: response.raw,
      transaction: {
        from: request.from,
        ...transaction
      },
      ...response.capabilities ? { capabilities: response.capabilities } : {}
    };
  } catch (err) {
    throw getTransactionError(err, {
      ...parameters,
      chain: client.chain
    });
  }
}
var init_fillTransaction = __esm({
  "node_modules/viem/_esm/actions/public/fillTransaction.js"() {
    init_parseAccount();
    init_fee();
    init_transaction();
    init_getTransactionError();
    init_extract();
    init_transaction2();
    init_transactionRequest();
    init_getAction();
    init_assertRequest();
    init_getBlock();
    init_getChainId();
    __name(fillTransaction, "fillTransaction");
  }
});

// node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
async function prepareTransactionRequest(client, args) {
  let request = args;
  request.account ??= client.account;
  request.parameters ??= defaultParameters;
  const { account: account_, chain = client.chain, nonceManager, parameters } = request;
  const prepareTransactionRequest2 = (() => {
    if (typeof chain?.prepareTransactionRequest === "function")
      return {
        fn: chain.prepareTransactionRequest,
        runAt: ["beforeFillTransaction"]
      };
    if (Array.isArray(chain?.prepareTransactionRequest))
      return {
        fn: chain.prepareTransactionRequest[0],
        runAt: chain.prepareTransactionRequest[1].runAt
      };
    return void 0;
  })();
  let chainId;
  async function getChainId2() {
    if (chainId)
      return chainId;
    if (typeof request.chainId !== "undefined")
      return request.chainId;
    if (chain)
      return chain.id;
    const chainId_ = await getAction(client, getChainId, "getChainId")({});
    chainId = chainId_;
    return chainId;
  }
  __name(getChainId2, "getChainId");
  let account = account_ ? parseAccount(account_) : account_;
  let nonce = request.nonce;
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("beforeFillTransaction")) {
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "beforeFillTransaction"
    });
    nonce ??= request.nonce;
    const sender = request.account ?? request.from;
    account = sender ? parseAccount(sender) : void 0;
  }
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account && nonceManager) {
    const chainId2 = await getChainId2();
    nonce = await nonceManager.consume({
      address: account.address,
      chainId: chainId2,
      client
    });
  }
  const attemptFill = (() => {
    if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && request.kzg && request.blobs)
      return false;
    if (parameters.length > 0 && "feePayer" in request && request.feePayer && !("feePayerSignature" in request && request.feePayerSignature))
      return true;
    if (supportsFillTransaction.get(client.uid) === false)
      return false;
    const shouldAttempt = ["fees", "gas"].some((parameter) => parameters.includes(parameter));
    if (!shouldAttempt)
      return false;
    if (parameters.includes("chainId") && typeof request.chainId !== "number")
      return true;
    if (parameters.includes("nonce") && typeof nonce !== "number")
      return true;
    if (parameters.includes("fees") && typeof request.gasPrice !== "bigint" && (typeof request.maxFeePerGas !== "bigint" || typeof request.maxPriorityFeePerGas !== "bigint"))
      return true;
    if (parameters.includes("gas") && typeof request.gas !== "bigint")
      return true;
    return false;
  })();
  const fillResult = attemptFill ? await getAction(client, fillTransaction, "fillTransaction")({ ...request, nonce }).then((result) => {
    const { chainId: chainId2, from: from16, gas: gas2, gasPrice, nonce: nonce2, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, type: type2, ...rest } = result.transaction;
    const feeToken = "feeToken" in rest ? rest.feeToken : void 0;
    const hasFilledFeePayerSignature = "feePayerSignature" in rest && rest.feePayerSignature !== null && typeof rest.feePayerSignature !== "undefined";
    const shouldUseFilledFeeToken = typeof feeToken !== "undefined" && feeToken !== null && (!("feeToken" in request) || hasFilledFeePayerSignature);
    supportsFillTransaction.set(client.uid, true);
    return {
      ...request,
      ...from16 ? { from: from16 } : {},
      ...type2 && !request.type ? { type: type2 } : {},
      ...typeof chainId2 !== "undefined" ? { chainId: chainId2 } : {},
      ...typeof gas2 !== "undefined" ? { gas: gas2 } : {},
      ...typeof gasPrice !== "undefined" ? { gasPrice } : {},
      ...typeof nonce2 !== "undefined" ? { nonce: nonce2 } : {},
      ...typeof maxFeePerBlobGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerBlobGas } : {},
      ...typeof maxFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerGas } : {},
      ...typeof maxPriorityFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxPriorityFeePerGas } : {},
      ..."nonceKey" in rest && typeof rest.nonceKey !== "undefined" ? { nonceKey: rest.nonceKey } : {},
      // Validity bounds are part of the fee-payer signing payload.
      ..."validBefore" in rest && rest.validBefore !== null && typeof rest.validBefore !== "undefined" ? { validBefore: rest.validBefore } : {},
      ..."validAfter" in rest && rest.validAfter !== null && typeof rest.validAfter !== "undefined" ? { validAfter: rest.validAfter } : {},
      ..."keyAuthorization" in rest && typeof rest.keyAuthorization !== "undefined" && rest.keyAuthorization !== null && !("keyAuthorization" in request) ? { keyAuthorization: rest.keyAuthorization } : {},
      ..."feePayerSignature" in rest && typeof rest.feePayerSignature !== "undefined" && rest.feePayerSignature !== null ? { feePayerSignature: rest.feePayerSignature } : {},
      ...shouldUseFilledFeeToken ? { feeToken } : {},
      ...result.capabilities ? { _capabilities: result.capabilities } : {}
    };
  }).catch((e) => {
    const error = e;
    if (error.name !== "TransactionExecutionError")
      return request;
    const nonceMismatch = error.walk?.((error2) => error2 instanceof FeePayerNonceMismatchError);
    if (nonceMismatch)
      throw e;
    const executionReverted = error.walk?.((e2) => {
      const error2 = e2;
      return error2.name === "ExecutionRevertedError";
    });
    if (executionReverted)
      throw e;
    const unsupported = error.walk?.((e2) => {
      const error2 = e2;
      return error2.name === "MethodNotFoundRpcError" || error2.name === "MethodNotSupportedRpcError" || error2.message?.includes("eth_fillTransaction is not available");
    });
    if (unsupported)
      supportsFillTransaction.set(client.uid, false);
    return request;
  }) : request;
  nonce ??= fillResult.nonce;
  request = {
    ...fillResult,
    ...account ? { from: account?.address } : {},
    ...typeof nonce !== "undefined" ? { nonce } : {}
  };
  const { blobs, gas, kzg, type } = request;
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("beforeFillParameters")) {
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "beforeFillParameters"
    });
  }
  let block;
  async function getBlock2() {
    if (block)
      return block;
    block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
    return block;
  }
  __name(getBlock2, "getBlock");
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account && !nonceManager)
    request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
  if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
    const commitments = blobsToCommitments({ blobs, kzg });
    if (parameters.includes("blobVersionedHashes")) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: "hex"
      });
      request.blobVersionedHashes = versionedHashes;
    }
    if (parameters.includes("sidecars")) {
      const proofs = blobsToProofs({ blobs, commitments, kzg });
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: "hex"
      });
      request.sidecars = sidecars;
    }
  }
  if (parameters.includes("chainId"))
    request.chainId = await getChainId2();
  if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
    try {
      request.type = getTransactionType(request);
    } catch {
      let isEip1559Network = eip1559NetworkCache.get(client.uid);
      if (typeof isEip1559Network === "undefined") {
        const block2 = await getBlock2();
        isEip1559Network = typeof block2?.baseFeePerGas === "bigint";
        eip1559NetworkCache.set(client.uid, isEip1559Network);
      }
      request.type = isEip1559Network ? "eip1559" : "legacy";
    }
  }
  if (parameters.includes("fees")) {
    if (request.type !== "legacy" && request.type !== "eip2930") {
      if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
        const block2 = await getBlock2();
        const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request
        });
        if (typeof request.maxPriorityFeePerGas === "undefined" && request.maxFeePerGas && request.maxFeePerGas < maxPriorityFeePerGas)
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas
          });
        request.maxPriorityFeePerGas = maxPriorityFeePerGas;
        request.maxFeePerGas = maxFeePerGas;
      }
    } else {
      if (typeof request.maxFeePerGas !== "undefined" || typeof request.maxPriorityFeePerGas !== "undefined")
        throw new Eip1559FeesNotSupportedError();
      if (typeof request.gasPrice === "undefined") {
        const block2 = await getBlock2();
        const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request,
          type: "legacy"
        });
        request.gasPrice = gasPrice_;
      }
    }
  }
  if (parameters.includes("gas") && typeof gas === "undefined")
    request.gas = await getAction(client, estimateGas, "estimateGas")({
      ...request,
      account,
      prepare: account?.type === "local" ? [] : ["blobVersionedHashes"]
    });
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("afterFillParameters"))
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "afterFillParameters"
    });
  assertRequest(request);
  delete request.parameters;
  return request;
}
var defaultParameters, eip1559NetworkCache, supportsFillTransaction;
var init_prepareTransactionRequest = __esm({
  "node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js"() {
    init_parseAccount();
    init_estimateFeesPerGas();
    init_estimateGas2();
    init_getBlock();
    init_getTransactionCount();
    init_fee();
    init_transaction();
    init_blobsToCommitments();
    init_blobsToProofs();
    init_commitmentsToVersionedHashes();
    init_toBlobSidecars();
    init_getAction();
    init_lru();
    init_assertRequest();
    init_getTransactionType();
    init_fillTransaction();
    init_getChainId();
    defaultParameters = [
      "blobVersionedHashes",
      "chainId",
      "fees",
      "gas",
      "nonce",
      "type"
    ];
    eip1559NetworkCache = /* @__PURE__ */ new Map();
    supportsFillTransaction = /* @__PURE__ */ new LruMap(128);
    __name(prepareTransactionRequest, "prepareTransactionRequest");
  }
});

// node_modules/viem/_esm/actions/public/estimateGas.js
async function estimateGas(client, args) {
  const { account: account_ = client.account, prepare = true } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  const parameters = (() => {
    if (Array.isArray(prepare))
      return prepare;
    if (account?.type !== "local")
      return ["blobVersionedHashes"];
    return void 0;
  })();
  try {
    const to = await (async () => {
      if (args.to)
        return args.to;
      if (args.authorizationList && args.authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: args.authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`");
        });
      return void 0;
    })();
    const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = prepare ? await prepareTransactionRequest(client, {
      ...args,
      parameters,
      to
    }) : args;
    if (gas && args.gas !== gas)
      return gas;
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format2 = chainFormat || formatTransactionRequest;
    const request = format2({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value
    }, "estimateGas");
    return BigInt(await client.request({
      method: "eth_estimateGas",
      params: rpcStateOverride ? [
        request,
        block ?? client.experimental_blockTag ?? "latest",
        rpcStateOverride
      ] : block ? [request, block] : [request]
    }));
  } catch (err) {
    throw getEstimateGasError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
var init_estimateGas2 = __esm({
  "node_modules/viem/_esm/actions/public/estimateGas.js"() {
    init_parseAccount();
    init_base();
    init_recoverAuthorizationAddress();
    init_toHex();
    init_getEstimateGasError();
    init_extract();
    init_transactionRequest();
    init_stateOverride2();
    init_assertRequest();
    init_prepareTransactionRequest();
    __name(estimateGas, "estimateGas");
  }
});

// node_modules/viem/_esm/actions/public/estimateContractGas.js
async function estimateContractGas(client, parameters) {
  const { abi: abi2, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...request } = parameters;
  const data = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const gas = await getAction(client, estimateGas, "estimateGas")({
      data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...request
    });
    return gas;
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : void 0;
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/estimateContractGas",
      functionName,
      sender: account?.address
    });
  }
}
var init_estimateContractGas = __esm({
  "node_modules/viem/_esm/actions/public/estimateContractGas.js"() {
    init_parseAccount();
    init_encodeFunctionData();
    init_getContractError();
    init_getAction();
    init_estimateGas2();
    __name(estimateContractGas, "estimateContractGas");
  }
});

// node_modules/viem/_esm/utils/address/isAddressEqual.js
function isAddressEqual(a, b) {
  if (!isAddress(a, { strict: false }))
    throw new InvalidAddressError({ address: a });
  if (!isAddress(b, { strict: false }))
    throw new InvalidAddressError({ address: b });
  return a.toLowerCase() === b.toLowerCase();
}
var init_isAddressEqual = __esm({
  "node_modules/viem/_esm/utils/address/isAddressEqual.js"() {
    init_address();
    init_isAddress();
    __name(isAddressEqual, "isAddressEqual");
  }
});

// node_modules/viem/_esm/utils/formatters/log.js
function formatLog(log, { args, eventName } = {}) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    blockTimestamp: log.blockTimestamp ? BigInt(log.blockTimestamp) : log.blockTimestamp === null ? null : void 0,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
    ...eventName ? { args, eventName } : {}
  };
}
var init_log2 = __esm({
  "node_modules/viem/_esm/utils/formatters/log.js"() {
    __name(formatLog, "formatLog");
  }
});

// node_modules/viem/_esm/utils/abi/decodeEventLog.js
function decodeEventLog(parameters) {
  const { abi: abi2, data, strict: strict_, topics } = parameters;
  const strict = strict_ ?? true;
  const [signature, ...argTopics] = topics;
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
  const abiItem = abi2.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem2(x)));
  if (!(abiItem && "name" in abiItem) || abiItem.type !== "event")
    throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
  const { name, inputs } = abiItem;
  const isUnnamed = inputs?.some((x) => !("name" in x && x.name));
  const args = isUnnamed ? [] : {};
  const indexedInputs = inputs.map((x, i) => [x, i]).filter(([x]) => "indexed" in x && x.indexed);
  const missingIndexedInputs = [];
  for (let i = 0; i < indexedInputs.length; i++) {
    const [param, argIndex] = indexedInputs[i];
    const topic = argTopics[i];
    if (!topic) {
      if (strict)
        throw new DecodeLogTopicsMismatch({
          abiItem,
          param
        });
      missingIndexedInputs.push([param, argIndex]);
      continue;
    }
    args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
      param,
      value: topic
    });
  }
  const nonIndexedInputs = inputs.filter((x) => !("indexed" in x && x.indexed));
  const inputsToDecode = strict ? nonIndexedInputs : [...missingIndexedInputs.map(([param]) => param), ...nonIndexedInputs];
  if (inputsToDecode.length > 0) {
    if (data && data !== "0x") {
      try {
        const decodedData = decodeAbiParameters(inputsToDecode, data);
        if (decodedData) {
          let dataIndex = 0;
          if (!strict) {
            for (const [param, argIndex] of missingIndexedInputs) {
              args[isUnnamed ? argIndex : param.name || argIndex] = decodedData[dataIndex++];
            }
          }
          if (isUnnamed) {
            for (let i = 0; i < inputs.length; i++)
              if (args[i] === void 0 && dataIndex < decodedData.length)
                args[i] = decodedData[dataIndex++];
          } else
            for (let i = 0; i < nonIndexedInputs.length; i++)
              args[nonIndexedInputs[i].name] = decodedData[dataIndex++];
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data,
              params: inputsToDecode,
              size: size(data)
            });
          throw err;
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: "0x",
        params: inputsToDecode,
        size: 0
      });
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : void 0
  };
}
function decodeTopic({ param, value }) {
  if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    return value;
  const decodedArg = decodeAbiParameters([param], value) || [];
  return decodedArg[0];
}
var docsPath3;
var init_decodeEventLog = __esm({
  "node_modules/viem/_esm/utils/abi/decodeEventLog.js"() {
    init_abi();
    init_cursor();
    init_size();
    init_toEventSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
    docsPath3 = "/docs/contract/decodeEventLog";
    __name(decodeEventLog, "decodeEventLog");
    __name(decodeTopic, "decodeTopic");
  }
});

// node_modules/viem/_esm/utils/abi/parseEventLogs.js
function parseEventLogs(parameters) {
  const { abi: abi2, args, logs, strict = true } = parameters;
  const eventName = (() => {
    if (!parameters.eventName)
      return void 0;
    if (Array.isArray(parameters.eventName))
      return parameters.eventName;
    return [parameters.eventName];
  })();
  const abiTopics = abi2.filter((abiItem) => abiItem.type === "event").map((abiItem) => ({
    abi: abiItem,
    selector: toEventSelector(abiItem)
  }));
  return logs.map((log) => {
    const formattedLog = typeof log.blockNumber === "string" ? formatLog(log) : log;
    const abiItems = abiTopics.filter((abiTopic) => formattedLog.topics[0] === abiTopic.selector);
    if (abiItems.length === 0)
      return null;
    let event;
    let abiItem;
    for (const item of abiItems) {
      try {
        event = decodeEventLog({
          ...formattedLog,
          abi: [item.abi],
          strict: true
        });
        abiItem = item;
        break;
      } catch {
      }
    }
    if (!event && !strict) {
      abiItem = abiItems[0];
      try {
        event = decodeEventLog({
          data: formattedLog.data,
          topics: formattedLog.topics,
          abi: [abiItem.abi],
          strict: false
        });
      } catch {
        const isUnnamed = abiItem.abi.inputs?.some((x) => !("name" in x && x.name));
        return {
          ...formattedLog,
          args: isUnnamed ? [] : {},
          eventName: abiItem.abi.name
        };
      }
    }
    if (!event || !abiItem)
      return null;
    if (eventName && !eventName.includes(event.eventName))
      return null;
    if (!includesArgs({
      args: event.args,
      inputs: abiItem.abi.inputs,
      matchArgs: args
    }))
      return null;
    return { ...event, ...formattedLog };
  }).filter(Boolean);
}
function includesArgs(parameters) {
  const { args, inputs, matchArgs } = parameters;
  if (!matchArgs)
    return true;
  if (!args)
    return false;
  function isEqual2(input, value, arg) {
    try {
      if (input.type === "address")
        return isAddressEqual(value, arg);
      if (input.type === "string")
        return keccak256(stringToBytes(value)) === arg;
      if (input.type === "bytes")
        return keccak256(toBytes(value)) === arg;
      return value === arg;
    } catch {
      return false;
    }
  }
  __name(isEqual2, "isEqual");
  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index2) => {
      if (value === null || value === void 0)
        return true;
      const input = inputs[index2];
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual2(input, value2, args[index2]));
    });
  }
  if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
    return Object.entries(matchArgs).every(([key, value]) => {
      if (value === null || value === void 0)
        return true;
      const input = inputs.find((input2) => input2.name === key);
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual2(input, value2, args[key]));
    });
  return false;
}
var init_parseEventLogs = __esm({
  "node_modules/viem/_esm/utils/abi/parseEventLogs.js"() {
    init_isAddressEqual();
    init_toBytes();
    init_log2();
    init_keccak256();
    init_toEventSelector();
    init_decodeEventLog();
    __name(parseEventLogs, "parseEventLogs");
    __name(includesArgs, "includesArgs");
  }
});

// node_modules/viem/_esm/actions/public/getLogs.js
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : void 0);
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args: events_ ? void 0 : args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  let logs;
  if (blockHash) {
    logs = await client.request({
      method: "eth_getLogs",
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs;
  return parseEventLogs({
    abi: events,
    args,
    logs: formattedLogs,
    strict
  });
}
var init_getLogs = __esm({
  "node_modules/viem/_esm/actions/public/getLogs.js"() {
    init_encodeEventTopics();
    init_parseEventLogs();
    init_toHex();
    init_log2();
    __name(getLogs, "getLogs");
  }
});

// node_modules/viem/_esm/actions/public/getContractEvents.js
async function getContractEvents(client, parameters) {
  const { abi: abi2, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
  const event = eventName ? getAbiItem({ abi: abi2, name: eventName }) : void 0;
  const events = !event ? abi2.filter((x) => x.type === "event") : void 0;
  return getAction(client, getLogs, "getLogs")({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict
  });
}
var init_getContractEvents = __esm({
  "node_modules/viem/_esm/actions/public/getContractEvents.js"() {
    init_getAbiItem();
    init_getAction();
    init_getLogs();
    __name(getContractEvents, "getContractEvents");
  }
});

// node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
function decodeFunctionResult(parameters) {
  const { abi: abi2, args, functionName, data } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({ abi: abi2, args, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath4 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
  const values = decodeAbiParameters(abiItem.outputs, data);
  if (values && values.length > 1)
    return values;
  if (values && values.length === 1)
    return values[0];
  return void 0;
}
var docsPath4;
var init_decodeFunctionResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeFunctionResult.js"() {
    init_abi();
    init_decodeAbiParameters();
    init_getAbiItem();
    docsPath4 = "/docs/contract/decodeFunctionResult";
    __name(decodeFunctionResult, "decodeFunctionResult");
  }
});

// node_modules/ox/_esm/core/version.js
var version3;
var init_version3 = __esm({
  "node_modules/ox/_esm/core/version.js"() {
    version3 = "0.1.1";
  }
});

// node_modules/ox/_esm/core/internal/errors.js
function getVersion() {
  return version3;
}
var init_errors2 = __esm({
  "node_modules/ox/_esm/core/internal/errors.js"() {
    init_version3();
    __name(getVersion, "getVersion");
  }
});

// node_modules/ox/_esm/core/Errors.js
function walk2(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause)
    return walk2(err.cause, fn);
  return fn ? null : err;
}
var BaseError3;
var init_Errors = __esm({
  "node_modules/ox/_esm/core/Errors.js"() {
    init_errors2();
    BaseError3 = class extends Error {
      static setStaticOptions(options) {
        BaseError3.prototype.docsOrigin = options.docsOrigin;
        BaseError3.prototype.showVersion = options.showVersion;
        BaseError3.prototype.version = options.version;
      }
      constructor(shortMessage, options = {}) {
        const details = (() => {
          if (options.cause instanceof BaseError3) {
            if (options.cause.details)
              return options.cause.details;
            if (options.cause.shortMessage)
              return options.cause.shortMessage;
          }
          if (options.cause && "details" in options.cause && typeof options.cause.details === "string")
            return options.cause.details;
          if (options.cause?.message)
            return options.cause.message;
          return options.details;
        })();
        const docsPath8 = (() => {
          if (options.cause instanceof BaseError3)
            return options.cause.docsPath || options.docsPath;
          return options.docsPath;
        })();
        const docsBaseUrl = options.docsOrigin ?? BaseError3.prototype.docsOrigin;
        const docs = `${docsBaseUrl}${docsPath8 ?? ""}`;
        const showVersion = Boolean(options.version ?? BaseError3.prototype.showVersion);
        const version4 = options.version ?? BaseError3.prototype.version;
        const message = [
          shortMessage || "An error occurred.",
          ...options.metaMessages ? ["", ...options.metaMessages] : [],
          ...details || docsPath8 || showVersion ? [
            "",
            details ? `Details: ${details}` : void 0,
            docsPath8 ? `See: ${docs}` : void 0,
            showVersion ? `Version: ${version4}` : void 0
          ] : []
        ].filter((x) => typeof x === "string").join("\n");
        super(message, options.cause ? { cause: options.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsOrigin", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "showVersion", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.cause = options.cause;
        this.details = details;
        this.docs = docs;
        this.docsOrigin = docsBaseUrl;
        this.docsPath = docsPath8;
        this.shortMessage = shortMessage;
        this.showVersion = showVersion;
        this.version = version4;
      }
      walk(fn) {
        return walk2(this, fn);
      }
    };
    __name(BaseError3, "BaseError");
    Object.defineProperty(BaseError3, "defaultStaticOptions", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {
        docsOrigin: "https://oxlib.sh",
        showVersion: false,
        version: `ox@${getVersion()}`
      }
    });
    (() => {
      BaseError3.setStaticOptions(BaseError3.defaultStaticOptions);
    })();
    __name(walk2, "walk");
  }
});

// node_modules/ox/_esm/core/internal/bytes.js
function assertSize2(bytes, size_) {
  if (size2(bytes) > size_)
    throw new SizeOverflowError2({
      givenSize: size2(bytes),
      maxSize: size_
    });
}
function assertStartOffset2(value, start) {
  if (typeof start === "number" && start > 0 && start > size2(value) - 1)
    throw new SliceOffsetOutOfBoundsError2({
      offset: start,
      position: "start",
      size: size2(value)
    });
}
function assertEndOffset2(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size2(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError2({
      offset: end,
      position: "end",
      size: size2(value)
    });
  }
}
function charCodeToBase162(char) {
  if (char >= charCodeMap2.zero && char <= charCodeMap2.nine)
    return char - charCodeMap2.zero;
  if (char >= charCodeMap2.A && char <= charCodeMap2.F)
    return char - (charCodeMap2.A - 10);
  if (char >= charCodeMap2.a && char <= charCodeMap2.f)
    return char - (charCodeMap2.a - 10);
  return void 0;
}
function pad2(bytes, options = {}) {
  const { dir, size: size5 = 32 } = options;
  if (size5 === 0)
    return bytes;
  if (bytes.length > size5)
    throw new SizeExceedsPaddingSizeError2({
      size: bytes.length,
      targetSize: size5,
      type: "Bytes"
    });
  const paddedBytes = new Uint8Array(size5);
  for (let i = 0; i < size5; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
function trim2(value, options = {}) {
  const { dir = "left" } = options;
  let data = value;
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  return data;
}
var charCodeMap2;
var init_bytes = __esm({
  "node_modules/ox/_esm/core/internal/bytes.js"() {
    init_Bytes();
    __name(assertSize2, "assertSize");
    __name(assertStartOffset2, "assertStartOffset");
    __name(assertEndOffset2, "assertEndOffset");
    charCodeMap2 = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
    __name(charCodeToBase162, "charCodeToBase16");
    __name(pad2, "pad");
    __name(trim2, "trim");
  }
});

// node_modules/ox/_esm/core/internal/hex.js
function assertSize3(hex, size_) {
  if (size3(hex) > size_)
    throw new SizeOverflowError3({
      givenSize: size3(hex),
      maxSize: size_
    });
}
function assertStartOffset3(value, start) {
  if (typeof start === "number" && start > 0 && start > size3(value) - 1)
    throw new SliceOffsetOutOfBoundsError3({
      offset: start,
      position: "start",
      size: size3(value)
    });
}
function assertEndOffset3(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size3(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError3({
      offset: end,
      position: "end",
      size: size3(value)
    });
  }
}
function pad3(hex_, options = {}) {
  const { dir, size: size5 = 32 } = options;
  if (size5 === 0)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size5 * 2)
    throw new SizeExceedsPaddingSizeError3({
      size: Math.ceil(hex.length / 2),
      targetSize: size5,
      type: "Hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
}
function trim3(value, options = {}) {
  const { dir = "left" } = options;
  let data = value.replace("0x", "");
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (data === "0")
    return "0x";
  if (dir === "right" && data.length % 2 === 1)
    return `0x${data}0`;
  return `0x${data}`;
}
var init_hex = __esm({
  "node_modules/ox/_esm/core/internal/hex.js"() {
    init_Hex();
    __name(assertSize3, "assertSize");
    __name(assertStartOffset3, "assertStartOffset");
    __name(assertEndOffset3, "assertEndOffset");
    __name(pad3, "pad");
    __name(trim3, "trim");
  }
});

// node_modules/ox/_esm/core/Json.js
function stringify2(value, replacer, space) {
  return JSON.stringify(value, (key, value2) => {
    if (typeof replacer === "function")
      return replacer(key, value2);
    if (typeof value2 === "bigint")
      return value2.toString() + bigIntSuffix;
    return value2;
  }, space);
}
var bigIntSuffix;
var init_Json = __esm({
  "node_modules/ox/_esm/core/Json.js"() {
    bigIntSuffix = "#__bigint";
    __name(stringify2, "stringify");
  }
});

// node_modules/ox/_esm/core/Bytes.js
function assert(value) {
  if (value instanceof Uint8Array)
    return;
  if (!value)
    throw new InvalidBytesTypeError(value);
  if (typeof value !== "object")
    throw new InvalidBytesTypeError(value);
  if (!("BYTES_PER_ELEMENT" in value))
    throw new InvalidBytesTypeError(value);
  if (value.BYTES_PER_ELEMENT !== 1 || value.constructor.name !== "Uint8Array")
    throw new InvalidBytesTypeError(value);
}
function from2(value) {
  if (value instanceof Uint8Array)
    return value;
  if (typeof value === "string")
    return fromHex(value);
  return fromArray(value);
}
function fromArray(value) {
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}
function fromHex(value, options = {}) {
  const { size: size5 } = options;
  let hex = value;
  if (size5) {
    assertSize3(value, size5);
    hex = padRight(value, size5);
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index2 = 0, j = 0; index2 < length; index2++) {
    const nibbleLeft = charCodeToBase162(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase162(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError3(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index2] = nibbleLeft << 4 | nibbleRight;
  }
  return bytes;
}
function fromString(value, options = {}) {
  const { size: size5 } = options;
  const bytes = encoder3.encode(value);
  if (typeof size5 === "number") {
    assertSize2(bytes, size5);
    return padRight2(bytes, size5);
  }
  return bytes;
}
function padRight2(value, size5) {
  return pad2(value, { dir: "right", size: size5 });
}
function size2(value) {
  return value.length;
}
function slice2(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset2(value, start);
  const value_ = value.slice(start, end);
  if (strict)
    assertEndOffset2(value_, start, end);
  return value_;
}
function toBigInt2(bytes, options = {}) {
  const { size: size5 } = options;
  if (typeof size5 !== "undefined")
    assertSize2(bytes, size5);
  const hex = fromBytes(bytes, options);
  return toBigInt(hex, options);
}
function toBoolean(bytes, options = {}) {
  const { size: size5 } = options;
  let bytes_ = bytes;
  if (typeof size5 !== "undefined") {
    assertSize2(bytes_, size5);
    bytes_ = trimLeft(bytes_);
  }
  if (bytes_.length > 1 || bytes_[0] > 1)
    throw new InvalidBytesBooleanError2(bytes_);
  return Boolean(bytes_[0]);
}
function toNumber2(bytes, options = {}) {
  const { size: size5 } = options;
  if (typeof size5 !== "undefined")
    assertSize2(bytes, size5);
  const hex = fromBytes(bytes, options);
  return toNumber(hex, options);
}
function toString(bytes, options = {}) {
  const { size: size5 } = options;
  let bytes_ = bytes;
  if (typeof size5 !== "undefined") {
    assertSize2(bytes_, size5);
    bytes_ = trimRight(bytes_);
  }
  return decoder.decode(bytes_);
}
function trimLeft(value) {
  return trim2(value, { dir: "left" });
}
function trimRight(value) {
  return trim2(value, { dir: "right" });
}
function validate(value) {
  try {
    assert(value);
    return true;
  } catch {
    return false;
  }
}
var decoder, encoder3, InvalidBytesBooleanError2, InvalidBytesTypeError, SizeOverflowError2, SliceOffsetOutOfBoundsError2, SizeExceedsPaddingSizeError2;
var init_Bytes = __esm({
  "node_modules/ox/_esm/core/Bytes.js"() {
    init_Errors();
    init_Hex();
    init_bytes();
    init_hex();
    init_Json();
    decoder = /* @__PURE__ */ new TextDecoder();
    encoder3 = /* @__PURE__ */ new TextEncoder();
    __name(assert, "assert");
    __name(from2, "from");
    __name(fromArray, "fromArray");
    __name(fromHex, "fromHex");
    __name(fromString, "fromString");
    __name(padRight2, "padRight");
    __name(size2, "size");
    __name(slice2, "slice");
    __name(toBigInt2, "toBigInt");
    __name(toBoolean, "toBoolean");
    __name(toNumber2, "toNumber");
    __name(toString, "toString");
    __name(trimLeft, "trimLeft");
    __name(trimRight, "trimRight");
    __name(validate, "validate");
    InvalidBytesBooleanError2 = class extends BaseError3 {
      constructor(bytes) {
        super(`Bytes value \`${bytes}\` is not a valid boolean.`, {
          metaMessages: [
            "The bytes array must contain a single byte of either a `0` or `1` value."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.InvalidBytesBooleanError"
        });
      }
    };
    __name(InvalidBytesBooleanError2, "InvalidBytesBooleanError");
    InvalidBytesTypeError = class extends BaseError3 {
      constructor(value) {
        super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid Bytes value.`, {
          metaMessages: ["Bytes values must be of type `Bytes`."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.InvalidBytesTypeError"
        });
      }
    };
    __name(InvalidBytesTypeError, "InvalidBytesTypeError");
    SizeOverflowError2 = class extends BaseError3 {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SizeOverflowError"
        });
      }
    };
    __name(SizeOverflowError2, "SizeOverflowError");
    SliceOffsetOutOfBoundsError2 = class extends BaseError3 {
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SliceOffsetOutOfBoundsError"
        });
      }
    };
    __name(SliceOffsetOutOfBoundsError2, "SliceOffsetOutOfBoundsError");
    SizeExceedsPaddingSizeError2 = class extends BaseError3 {
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SizeExceedsPaddingSizeError"
        });
      }
    };
    __name(SizeExceedsPaddingSizeError2, "SizeExceedsPaddingSizeError");
  }
});

// node_modules/ox/_esm/core/Hex.js
function assert2(value, options = {}) {
  const { strict = false } = options;
  if (!value)
    throw new InvalidHexTypeError(value);
  if (typeof value !== "string")
    throw new InvalidHexTypeError(value);
  if (strict) {
    if (!/^0x[0-9a-fA-F]*$/.test(value))
      throw new InvalidHexValueError(value);
  }
  if (!value.startsWith("0x"))
    throw new InvalidHexValueError(value);
}
function concat2(...values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
function from3(value) {
  if (value instanceof Uint8Array)
    return fromBytes(value);
  if (Array.isArray(value))
    return fromBytes(new Uint8Array(value));
  return value;
}
function fromBoolean(value, options = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padLeft(hex, options.size);
  }
  return hex;
}
function fromBytes(value, options = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++)
    string += hexes3[value[i]];
  const hex = `0x${string}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padRight(hex, options.size);
  }
  return hex;
}
function fromNumber(value, options = {}) {
  const { signed, size: size5 } = options;
  const value_ = BigInt(value);
  let maxValue;
  if (size5) {
    if (signed)
      maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
  } else if (typeof value === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value_ > maxValue || value_ < minValue) {
    const suffix = typeof value === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError2({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size5,
      value: `${value}${suffix}`
    });
  }
  const stringValue = (signed && value_ < 0 ? BigInt.asUintN(size5 * 8, BigInt(value_)) : value_).toString(16);
  const hex = `0x${stringValue}`;
  if (size5)
    return padLeft(hex, size5);
  return hex;
}
function fromString2(value, options = {}) {
  return fromBytes(encoder4.encode(value), options);
}
function padLeft(value, size5) {
  return pad3(value, { dir: "left", size: size5 });
}
function padRight(value, size5) {
  return pad3(value, { dir: "right", size: size5 });
}
function slice3(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset3(value, start);
  const value_ = `0x${value.replace("0x", "").slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
  if (strict)
    assertEndOffset3(value_, start, end);
  return value_;
}
function size3(value) {
  return Math.ceil((value.length - 2) / 2);
}
function trimLeft2(value) {
  return trim3(value, { dir: "left" });
}
function toBigInt(hex, options = {}) {
  const { signed } = options;
  if (options.size)
    assertSize3(hex, options.size);
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size5 = (hex.length - 2) / 2;
  const max_unsigned = (1n << BigInt(size5) * 8n) - 1n;
  const max_signed = max_unsigned >> 1n;
  if (value <= max_signed)
    return value;
  return value - max_unsigned - 1n;
}
function toNumber(hex, options = {}) {
  const { signed, size: size5 } = options;
  if (!signed && !size5)
    return Number(hex);
  return Number(toBigInt(hex, options));
}
function validate2(value, options = {}) {
  const { strict = false } = options;
  try {
    assert2(value, { strict });
    return true;
  } catch {
    return false;
  }
}
var encoder4, hexes3, IntegerOutOfRangeError2, InvalidHexTypeError, InvalidHexValueError, SizeOverflowError3, SliceOffsetOutOfBoundsError3, SizeExceedsPaddingSizeError3;
var init_Hex = __esm({
  "node_modules/ox/_esm/core/Hex.js"() {
    init_Errors();
    init_hex();
    init_Json();
    encoder4 = /* @__PURE__ */ new TextEncoder();
    hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    __name(assert2, "assert");
    __name(concat2, "concat");
    __name(from3, "from");
    __name(fromBoolean, "fromBoolean");
    __name(fromBytes, "fromBytes");
    __name(fromNumber, "fromNumber");
    __name(fromString2, "fromString");
    __name(padLeft, "padLeft");
    __name(padRight, "padRight");
    __name(slice3, "slice");
    __name(size3, "size");
    __name(trimLeft2, "trimLeft");
    __name(toBigInt, "toBigInt");
    __name(toNumber, "toNumber");
    __name(validate2, "validate");
    IntegerOutOfRangeError2 = class extends BaseError3 {
      constructor({ max, min, signed, size: size5, value }) {
        super(`Number \`${value}\` is not in safe${size5 ? ` ${size5 * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.IntegerOutOfRangeError"
        });
      }
    };
    __name(IntegerOutOfRangeError2, "IntegerOutOfRangeError");
    InvalidHexTypeError = class extends BaseError3 {
      constructor(value) {
        super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, {
          metaMessages: ['Hex types must be represented as `"0x${string}"`.']
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.InvalidHexTypeError"
        });
      }
    };
    __name(InvalidHexTypeError, "InvalidHexTypeError");
    InvalidHexValueError = class extends BaseError3 {
      constructor(value) {
        super(`Value \`${value}\` is an invalid hex value.`, {
          metaMessages: [
            'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.InvalidHexValueError"
        });
      }
    };
    __name(InvalidHexValueError, "InvalidHexValueError");
    SizeOverflowError3 = class extends BaseError3 {
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SizeOverflowError"
        });
      }
    };
    __name(SizeOverflowError3, "SizeOverflowError");
    SliceOffsetOutOfBoundsError3 = class extends BaseError3 {
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SliceOffsetOutOfBoundsError"
        });
      }
    };
    __name(SliceOffsetOutOfBoundsError3, "SliceOffsetOutOfBoundsError");
    SizeExceedsPaddingSizeError3 = class extends BaseError3 {
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SizeExceedsPaddingSizeError"
        });
      }
    };
    __name(SizeExceedsPaddingSizeError3, "SizeExceedsPaddingSizeError");
  }
});

// node_modules/ox/_esm/core/Withdrawal.js
function toRpc(withdrawal) {
  return {
    address: withdrawal.address,
    amount: fromNumber(withdrawal.amount),
    index: fromNumber(withdrawal.index),
    validatorIndex: fromNumber(withdrawal.validatorIndex)
  };
}
var init_Withdrawal = __esm({
  "node_modules/ox/_esm/core/Withdrawal.js"() {
    init_Hex();
    __name(toRpc, "toRpc");
  }
});

// node_modules/ox/_esm/core/BlockOverrides.js
function toRpc2(blockOverrides) {
  return {
    ...typeof blockOverrides.baseFeePerGas === "bigint" && {
      baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas)
    },
    ...typeof blockOverrides.blobBaseFee === "bigint" && {
      blobBaseFee: fromNumber(blockOverrides.blobBaseFee)
    },
    ...typeof blockOverrides.feeRecipient === "string" && {
      feeRecipient: blockOverrides.feeRecipient
    },
    ...typeof blockOverrides.gasLimit === "bigint" && {
      gasLimit: fromNumber(blockOverrides.gasLimit)
    },
    ...typeof blockOverrides.number === "bigint" && {
      number: fromNumber(blockOverrides.number)
    },
    ...typeof blockOverrides.prevRandao === "bigint" && {
      prevRandao: fromNumber(blockOverrides.prevRandao)
    },
    ...typeof blockOverrides.time === "bigint" && {
      time: fromNumber(blockOverrides.time)
    },
    ...blockOverrides.withdrawals && {
      withdrawals: blockOverrides.withdrawals.map(toRpc)
    }
  };
}
var init_BlockOverrides = __esm({
  "node_modules/ox/_esm/core/BlockOverrides.js"() {
    init_Hex();
    init_Withdrawal();
    __name(toRpc2, "toRpc");
  }
});

// node_modules/viem/_esm/constants/abis.js
var multicall3Abi, batchGatewayAbi, universalResolverErrors, universalResolverResolveAbi, universalResolverReverseAbi, textResolverAbi, addressResolverAbi, erc1271Abi, erc6492SignatureValidatorAbi, erc20Abi;
var init_abis = __esm({
  "node_modules/viem/_esm/constants/abis.js"() {
    multicall3Abi = [
      {
        inputs: [
          {
            components: [
              {
                name: "target",
                type: "address"
              },
              {
                name: "allowFailure",
                type: "bool"
              },
              {
                name: "callData",
                type: "bytes"
              }
            ],
            name: "calls",
            type: "tuple[]"
          }
        ],
        name: "aggregate3",
        outputs: [
          {
            components: [
              {
                name: "success",
                type: "bool"
              },
              {
                name: "returnData",
                type: "bytes"
              }
            ],
            name: "returnData",
            type: "tuple[]"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "addr",
            type: "address"
          }
        ],
        name: "getEthBalance",
        outputs: [
          {
            name: "balance",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "getCurrentBlockTimestamp",
        outputs: [
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ];
    batchGatewayAbi = [
      {
        name: "query",
        type: "function",
        stateMutability: "view",
        inputs: [
          {
            type: "tuple[]",
            name: "queries",
            components: [
              {
                type: "address",
                name: "sender"
              },
              {
                type: "string[]",
                name: "urls"
              },
              {
                type: "bytes",
                name: "data"
              }
            ]
          }
        ],
        outputs: [
          {
            type: "bool[]",
            name: "failures"
          },
          {
            type: "bytes[]",
            name: "responses"
          }
        ]
      },
      {
        name: "HttpError",
        type: "error",
        inputs: [
          {
            type: "uint16",
            name: "status"
          },
          {
            type: "string",
            name: "message"
          }
        ]
      }
    ];
    universalResolverErrors = [
      {
        inputs: [
          {
            name: "dns",
            type: "bytes"
          }
        ],
        name: "DNSDecodingFailed",
        type: "error"
      },
      {
        inputs: [
          {
            name: "ens",
            type: "string"
          }
        ],
        name: "DNSEncodingFailed",
        type: "error"
      },
      {
        inputs: [],
        name: "EmptyAddress",
        type: "error"
      },
      {
        inputs: [
          {
            name: "status",
            type: "uint16"
          },
          {
            name: "message",
            type: "string"
          }
        ],
        name: "HttpError",
        type: "error"
      },
      {
        inputs: [],
        name: "InvalidBatchGatewayResponse",
        type: "error"
      },
      {
        inputs: [
          {
            name: "errorData",
            type: "bytes"
          }
        ],
        name: "ResolverError",
        type: "error"
      },
      {
        inputs: [
          {
            name: "name",
            type: "bytes"
          },
          {
            name: "resolver",
            type: "address"
          }
        ],
        name: "ResolverNotContract",
        type: "error"
      },
      {
        inputs: [
          {
            name: "name",
            type: "bytes"
          }
        ],
        name: "ResolverNotFound",
        type: "error"
      },
      {
        inputs: [
          {
            name: "primary",
            type: "string"
          },
          {
            name: "primaryAddress",
            type: "bytes"
          }
        ],
        name: "ReverseAddressMismatch",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4"
          }
        ],
        name: "UnsupportedResolverProfile",
        type: "error"
      }
    ];
    universalResolverResolveAbi = [
      ...universalResolverErrors,
      {
        name: "resolveWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes" },
          { name: "data", type: "bytes" },
          { name: "gateways", type: "string[]" }
        ],
        outputs: [
          { name: "", type: "bytes" },
          { name: "address", type: "address" }
        ]
      }
    ];
    universalResolverReverseAbi = [
      ...universalResolverErrors,
      {
        name: "reverseWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "bytes", name: "reverseName" },
          { type: "uint256", name: "coinType" },
          { type: "string[]", name: "gateways" }
        ],
        outputs: [
          { type: "string", name: "resolvedName" },
          { type: "address", name: "resolver" },
          { type: "address", name: "reverseResolver" }
        ]
      }
    ];
    textResolverAbi = [
      {
        name: "text",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "key", type: "string" }
        ],
        outputs: [{ name: "", type: "string" }]
      }
    ];
    addressResolverAbi = [
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "name", type: "bytes32" }],
        outputs: [{ name: "", type: "address" }]
      },
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "coinType", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bytes" }]
      }
    ];
    erc1271Abi = [
      {
        name: "isValidSignature",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "hash", type: "bytes32" },
          { name: "signature", type: "bytes" }
        ],
        outputs: [{ name: "", type: "bytes4" }]
      }
    ];
    erc6492SignatureValidatorAbi = [
      {
        inputs: [
          {
            name: "_signer",
            type: "address"
          },
          {
            name: "_hash",
            type: "bytes32"
          },
          {
            name: "_signature",
            type: "bytes"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            name: "_signer",
            type: "address"
          },
          {
            name: "_hash",
            type: "bytes32"
          },
          {
            name: "_signature",
            type: "bytes"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "isValidSig"
      }
    ];
    erc20Abi = [
      {
        type: "event",
        name: "Approval",
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            name: "spender",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ]
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address"
          },
          {
            indexed: true,
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
          {
            name: "owner",
            type: "address"
          },
          {
            name: "spender",
            type: "address"
          }
        ],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "approve",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "spender",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      },
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [
          {
            name: "account",
            type: "address"
          }
        ],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "decimals",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "uint8"
          }
        ]
      },
      {
        type: "function",
        name: "name",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "string"
          }
        ]
      },
      {
        type: "function",
        name: "symbol",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "string"
          }
        ]
      },
      {
        type: "function",
        name: "totalSupply",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      },
      {
        type: "function",
        name: "transferFrom",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      }
    ];
  }
});

// node_modules/viem/_esm/constants/contract.js
var aggregate3Signature;
var init_contract2 = __esm({
  "node_modules/viem/_esm/constants/contract.js"() {
    aggregate3Signature = "0x82ad56cb";
  }
});

// node_modules/viem/_esm/constants/contracts.js
var deploylessCallViaBytecodeBytecode, deploylessCallViaFactoryBytecode, erc6492SignatureValidatorByteCode, multicall3Bytecode;
var init_contracts = __esm({
  "node_modules/viem/_esm/constants/contracts.js"() {
    deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe";
    deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe";
    erc6492SignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
    multicall3Bytecode = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";
  }
});

// node_modules/viem/_esm/errors/chain.js
var ChainDoesNotSupportContract, ChainMismatchError, ChainNotFoundError, ClientChainNotConfiguredError, InvalidChainIdError;
var init_chain = __esm({
  "node_modules/viem/_esm/errors/chain.js"() {
    init_base();
    ChainDoesNotSupportContract = class extends BaseError2 {
      constructor({ blockNumber, chain, contract }) {
        super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
          metaMessages: [
            "This could be due to any of the following:",
            ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
              `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
            ] : [
              `- The chain does not have the contract "${contract.name}" configured.`
            ]
          ],
          name: "ChainDoesNotSupportContract"
        });
      }
    };
    __name(ChainDoesNotSupportContract, "ChainDoesNotSupportContract");
    ChainMismatchError = class extends BaseError2 {
      constructor({ chain, currentChainId }) {
        super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} \u2013 ${chain.name}).`, {
          metaMessages: [
            `Current Chain ID:  ${currentChainId}`,
            `Expected Chain ID: ${chain.id} \u2013 ${chain.name}`
          ],
          name: "ChainMismatchError"
        });
      }
    };
    __name(ChainMismatchError, "ChainMismatchError");
    ChainNotFoundError = class extends BaseError2 {
      constructor() {
        super([
          "No chain was provided to the request.",
          "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."
        ].join("\n"), {
          name: "ChainNotFoundError"
        });
      }
    };
    __name(ChainNotFoundError, "ChainNotFoundError");
    ClientChainNotConfiguredError = class extends BaseError2 {
      constructor() {
        super("No chain was provided to the Client.", {
          name: "ClientChainNotConfiguredError"
        });
      }
    };
    __name(ClientChainNotConfiguredError, "ClientChainNotConfiguredError");
    InvalidChainIdError = class extends BaseError2 {
      constructor({ chainId }) {
        super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
      }
    };
    __name(InvalidChainIdError, "InvalidChainIdError");
  }
});

// node_modules/viem/_esm/utils/abi/encodeDeployData.js
function encodeDeployData(parameters) {
  const { abi: abi2, args, bytecode } = parameters;
  if (!args || args.length === 0)
    return bytecode;
  const description = abi2.find((x) => "type" in x && x.type === "constructor");
  if (!description)
    throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
  if (!("inputs" in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  const data = encodeAbiParameters(description.inputs, args);
  return concatHex([bytecode, data]);
}
var docsPath5;
var init_encodeDeployData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeDeployData.js"() {
    init_abi();
    init_concat();
    init_encodeAbiParameters();
    docsPath5 = "/docs/contract/encodeDeployData";
    __name(encodeDeployData, "encodeDeployData");
  }
});

// node_modules/viem/_esm/utils/chain/getChainContractAddress.js
function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name }
    });
  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated
      }
    });
  return contract.address;
}
var init_getChainContractAddress = __esm({
  "node_modules/viem/_esm/utils/chain/getChainContractAddress.js"() {
    init_chain();
    __name(getChainContractAddress, "getChainContractAddress");
  }
});

// node_modules/viem/_esm/utils/errors/getCallError.js
function getCallError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new CallExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
var init_getCallError = __esm({
  "node_modules/viem/_esm/utils/errors/getCallError.js"() {
    init_contract();
    init_node();
    init_getNodeError();
    __name(getCallError, "getCallError");
  }
});

// node_modules/viem/_esm/utils/promise/withResolvers.js
function withResolvers() {
  let resolve = /* @__PURE__ */ __name(() => void 0, "resolve");
  let reject = /* @__PURE__ */ __name(() => void 0, "reject");
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, resolve, reject };
}
var init_withResolvers = __esm({
  "node_modules/viem/_esm/utils/promise/withResolvers.js"() {
    __name(withResolvers, "withResolvers");
  }
});

// node_modules/viem/_esm/utils/promise/createBatchScheduler.js
function createBatchScheduler({ fn, id, shouldSplitBatch, wait: wait2 = 0, sort }) {
  const exec = /* @__PURE__ */ __name(async () => {
    const scheduler = getScheduler();
    flush();
    const args = scheduler.map(({ args: args2 }) => args2);
    if (args.length === 0)
      return;
    fn(args).then((data) => {
      if (sort && Array.isArray(data))
        data.sort(sort);
      for (let i = 0; i < scheduler.length; i++) {
        const { resolve } = scheduler[i];
        resolve?.([data[i], data]);
      }
    }).catch((err) => {
      for (let i = 0; i < scheduler.length; i++) {
        const { reject } = scheduler[i];
        reject?.(err);
      }
    });
  }, "exec");
  const flush = /* @__PURE__ */ __name(() => schedulerCache.delete(id), "flush");
  const getBatchedArgs = /* @__PURE__ */ __name(() => getScheduler().map(({ args }) => args), "getBatchedArgs");
  const getScheduler = /* @__PURE__ */ __name(() => schedulerCache.get(id) || [], "getScheduler");
  const setScheduler = /* @__PURE__ */ __name((item) => schedulerCache.set(id, [...getScheduler(), item]), "setScheduler");
  return {
    flush,
    async schedule(args) {
      const { promise, resolve, reject } = withResolvers();
      const split2 = shouldSplitBatch?.([...getBatchedArgs(), args]);
      if (split2)
        exec();
      const hasActiveScheduler = getScheduler().length > 0;
      if (hasActiveScheduler) {
        setScheduler({ args, resolve, reject });
        return promise;
      }
      setScheduler({ args, resolve, reject });
      setTimeout(exec, wait2);
      return promise;
    }
  };
}
var schedulerCache;
var init_createBatchScheduler = __esm({
  "node_modules/viem/_esm/utils/promise/createBatchScheduler.js"() {
    init_withResolvers();
    schedulerCache = /* @__PURE__ */ new Map();
    __name(createBatchScheduler, "createBatchScheduler");
  }
});

// node_modules/viem/_esm/errors/ccip.js
var OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError;
var init_ccip = __esm({
  "node_modules/viem/_esm/errors/ccip.js"() {
    init_stringify();
    init_base();
    init_utils3();
    OffchainLookupError = class extends BaseError2 {
      constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
        super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
          cause,
          metaMessages: [
            ...cause.metaMessages || [],
            cause.metaMessages?.length ? "" : [],
            "Offchain Gateway Call:",
            urls && [
              "  Gateway URL(s):",
              ...urls.map((url) => `    ${getUrl(url)}`)
            ],
            `  Sender: ${sender}`,
            `  Data: ${data}`,
            `  Callback selector: ${callbackSelector}`,
            `  Extra data: ${extraData}`
          ].flat(),
          name: "OffchainLookupError"
        });
      }
    };
    __name(OffchainLookupError, "OffchainLookupError");
    OffchainLookupResponseMalformedError = class extends BaseError2 {
      constructor({ result, url }) {
        super("Offchain gateway response is malformed. Response data must be a hex value.", {
          metaMessages: [
            `Gateway URL: ${getUrl(url)}`,
            `Response: ${stringify(result)}`
          ],
          name: "OffchainLookupResponseMalformedError"
        });
      }
    };
    __name(OffchainLookupResponseMalformedError, "OffchainLookupResponseMalformedError");
    OffchainLookupSenderMismatchError = class extends BaseError2 {
      constructor({ sender, to }) {
        super("Reverted sender address does not match target contract address (`to`).", {
          metaMessages: [
            `Contract address: ${to}`,
            `OffchainLookup sender address: ${sender}`
          ],
          name: "OffchainLookupSenderMismatchError"
        });
      }
    };
    __name(OffchainLookupSenderMismatchError, "OffchainLookupSenderMismatchError");
  }
});

// node_modules/viem/_esm/utils/abi/decodeFunctionData.js
function decodeFunctionData(parameters) {
  const { abi: abi2, data } = parameters;
  const signature = slice(data, 0, 4);
  const description = abi2.find((x) => x.type === "function" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!description)
    throw new AbiFunctionSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeFunctionData"
    });
  return {
    functionName: description.name,
    args: "inputs" in description && description.inputs && description.inputs.length > 0 ? decodeAbiParameters(description.inputs, slice(data, 4)) : void 0
  };
}
var init_decodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/decodeFunctionData.js"() {
    init_abi();
    init_slice();
    init_toFunctionSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
    __name(decodeFunctionData, "decodeFunctionData");
  }
});

// node_modules/viem/_esm/utils/abi/encodeErrorResult.js
function encodeErrorResult(parameters) {
  const { abi: abi2, errorName, args } = parameters;
  let abiItem = abi2[0];
  if (errorName) {
    const item = getAbiItem({ abi: abi2, args, name: errorName });
    if (!item)
      throw new AbiErrorNotFoundError(errorName, { docsPath: docsPath6 });
    abiItem = item;
  }
  if (abiItem.type !== "error")
    throw new AbiErrorNotFoundError(void 0, { docsPath: docsPath6 });
  const definition = formatAbiItem2(abiItem);
  const signature = toFunctionSelector(definition);
  let data = "0x";
  if (args && args.length > 0) {
    if (!abiItem.inputs)
      throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath: docsPath6 });
    data = encodeAbiParameters(abiItem.inputs, args);
  }
  return concatHex([signature, data]);
}
var docsPath6;
var init_encodeErrorResult = __esm({
  "node_modules/viem/_esm/utils/abi/encodeErrorResult.js"() {
    init_abi();
    init_concat();
    init_toFunctionSelector();
    init_encodeAbiParameters();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath6 = "/docs/contract/encodeErrorResult";
    __name(encodeErrorResult, "encodeErrorResult");
  }
});

// node_modules/viem/_esm/utils/abi/encodeFunctionResult.js
function encodeFunctionResult(parameters) {
  const { abi: abi2, functionName, result } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({ abi: abi2, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath7 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath7 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath7 });
  const values = (() => {
    if (abiItem.outputs.length === 0)
      return [];
    if (abiItem.outputs.length === 1)
      return [result];
    if (Array.isArray(result))
      return result;
    throw new InvalidArrayError(result);
  })();
  return encodeAbiParameters(abiItem.outputs, values);
}
var docsPath7;
var init_encodeFunctionResult = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionResult.js"() {
    init_abi();
    init_encodeAbiParameters();
    init_getAbiItem();
    docsPath7 = "/docs/contract/encodeFunctionResult";
    __name(encodeFunctionResult, "encodeFunctionResult");
  }
});

// node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js
async function localBatchGatewayRequest(parameters) {
  const { data, ccipRequest: ccipRequest2 } = parameters;
  const { args: [queries] } = decodeFunctionData({ abi: batchGatewayAbi, data });
  const failures = [];
  const responses = [];
  await Promise.all(queries.map(async (query, i) => {
    try {
      responses[i] = query.urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({ data: query.data, ccipRequest: ccipRequest2 }) : await ccipRequest2(query);
      failures[i] = false;
    } catch (err) {
      failures[i] = true;
      responses[i] = encodeError(err);
    }
  }));
  return encodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: "query",
    result: [failures, responses]
  });
}
function encodeError(error) {
  if (error.name === "HttpRequestError" && error.status)
    return encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: "HttpError",
      args: [error.status, error.shortMessage]
    });
  return encodeErrorResult({
    abi: [solidityError],
    errorName: "Error",
    args: ["shortMessage" in error ? error.shortMessage : error.message]
  });
}
var localBatchGatewayUrl;
var init_localBatchGatewayRequest = __esm({
  "node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js"() {
    init_abis();
    init_solidity();
    init_decodeFunctionData();
    init_encodeErrorResult();
    init_encodeFunctionResult();
    localBatchGatewayUrl = "x-batch-gateway:true";
    __name(localBatchGatewayRequest, "localBatchGatewayRequest");
    __name(encodeError, "encodeError");
  }
});

// node_modules/viem/_esm/utils/ccip.js
var ccip_exports = {};
__export(ccip_exports, {
  ccipRequest: () => ccipRequest,
  offchainLookup: () => offchainLookup,
  offchainLookupAbiItem: () => offchainLookupAbiItem,
  offchainLookupSignature: () => offchainLookupSignature
});
async function offchainLookup(client, { blockNumber, blockTag, data, requestOptions, to }) {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem]
  });
  const [sender, urls, callData, callbackSelector, extraData] = args;
  const { ccipRead } = client;
  const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to });
    const result = urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({
      data: callData,
      ccipRequest: (parameters) => ccipRequest_({ ...parameters, requestOptions })
    }) : await ccipRequest_({ data: callData, requestOptions, sender, urls });
    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
      ]),
      requestOptions,
      to
    });
    return data_;
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    if (isAbortError(err))
      throw err;
    throw new OffchainLookupError({
      callbackSelector,
      cause: err,
      data,
      extraData,
      sender,
      urls
    });
  }
}
async function ccipRequest({ data, requestOptions, sender, urls }) {
  let error = new Error("An unknown error occurred.");
  for (let i = 0; i < urls.length; i++) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    const url = urls[i];
    const method = url.includes("{data}") ? "GET" : "POST";
    const body = method === "POST" ? { data, sender } : void 0;
    const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
    try {
      const response = await fetch(url.replace("{sender}", sender.toLowerCase()).replace("{data}", data), {
        body: JSON.stringify(body),
        headers,
        method,
        ...requestOptions?.signal ? { signal: requestOptions.signal } : {}
      });
      let result;
      if (response.headers.get("Content-Type")?.startsWith("application/json")) {
        result = (await response.json()).data;
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error ? stringify(result.error) : response.statusText,
          headers: response.headers,
          status: response.status,
          url
        });
        continue;
      }
      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url
        });
        continue;
      }
      return result;
    } catch (err) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal);
      if (isAbortError(err))
        throw err;
      error = new HttpRequestError({
        body,
        details: err.message,
        url
      });
    }
  }
  throw error;
}
var offchainLookupSignature, offchainLookupAbiItem;
var init_ccip2 = __esm({
  "node_modules/viem/_esm/utils/ccip.js"() {
    init_call();
    init_ccip();
    init_request();
    init_utils3();
    init_decodeErrorResult();
    init_encodeAbiParameters();
    init_isAddressEqual();
    init_concat();
    init_isHex();
    init_localBatchGatewayRequest();
    init_stringify();
    offchainLookupSignature = "0x556f1830";
    offchainLookupAbiItem = {
      name: "OffchainLookup",
      type: "error",
      inputs: [
        {
          name: "sender",
          type: "address"
        },
        {
          name: "urls",
          type: "string[]"
        },
        {
          name: "callData",
          type: "bytes"
        },
        {
          name: "callbackFunction",
          type: "bytes4"
        },
        {
          name: "extraData",
          type: "bytes"
        }
      ]
    };
    __name(offchainLookup, "offchainLookup");
    __name(ccipRequest, "ccipRequest");
  }
});

// node_modules/viem/_esm/actions/public/call.js
async function call(client, args) {
  const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, requestOptions, to, value, stateOverride, ...rest } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (code && (factory || factoryData))
    throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
  if (code && to)
    throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
  const deploylessCallViaBytecode = code && data_;
  const deploylessCallViaFactory = factory && factoryData && to && data_;
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({
        code,
        data: data_
      });
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory,
        factoryData,
        to
      });
    return data_;
  })();
  try {
    assertRequest(args);
    const block = formatBlockParameter({
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical
    });
    const rpcBlockOverrides = blockOverrides ? toRpc2(blockOverrides) : void 0;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format2 = chainFormat || formatTransactionRequest;
    const request = format2({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      accessList,
      account,
      authorizationList,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: deploylessCall ? void 0 : to,
      value
    }, "call");
    if (batch && shouldPerformMulticall({ request }) && !rpcBlockOverrides && blockHash === void 0) {
      try {
        const { deployless = false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
        const multicallAddress = getMulticallAddress(client, {
          blockNumber,
          deployless
        });
        if (!multicallAddress || !hasStateOverrideForAddress(rpcStateOverride, multicallAddress))
          return await scheduleMulticall(client, {
            ...request,
            blockHash,
            blockNumber,
            blockTag,
            multicallAddress,
            requestOptions,
            requireCanonical,
            rpcStateOverride
          });
      } catch (err) {
        if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
          throw err;
      }
    }
    const params = (() => {
      const base2 = [
        request,
        block
      ];
      if (rpcStateOverride && rpcBlockOverrides)
        return [...base2, rpcStateOverride, rpcBlockOverrides];
      if (rpcStateOverride)
        return [...base2, rpcStateOverride];
      if (rpcBlockOverrides)
        return [...base2, {}, rpcBlockOverrides];
      return base2;
    })();
    const response = await client.request({
      method: "eth_call",
      params
    }, requestOptions);
    if (response === "0x")
      return { data: void 0 };
    return { data: response };
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    if (isAbortError(err))
      throw err;
    const data2 = getRevertErrorData(err);
    const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), ccip_exports));
    if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
      return {
        data: await offchainLookup2(client, { data: data2, requestOptions, to })
      };
    if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
      throw new CounterfactualDeploymentFailedError({ factory });
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
function shouldPerformMulticall({ request }) {
  const { data, to, ...request_ } = request;
  if (!data)
    return false;
  if (data.startsWith(aggregate3Signature))
    return false;
  if (!to)
    return false;
  if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0)
    return false;
  return true;
}
function getRequestOptionsId(requestOptions) {
  if (!requestOptions)
    return "default";
  const id = requestOptionsIds.get(requestOptions);
  if (id !== void 0)
    return id;
  const nextId = requestOptionsId++;
  requestOptionsIds.set(requestOptions, nextId);
  return nextId;
}
async function scheduleMulticall(client, args) {
  const { batchSize = 1024, deployless = false, wait: wait2 = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, data, multicallAddress: multicallAddress_, requestOptions, rpcStateOverride, to } = args;
  const multicallAddress = multicallAddress_ !== void 0 ? multicallAddress_ : getMulticallAddress(client, {
    blockNumber,
    deployless
  });
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const blockId = typeof block === "string" ? block : JSON.stringify(block);
  const stateOverrideKey = rpcStateOverride ? `.${JSON.stringify(rpcStateOverride)}` : "";
  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${blockId}.${getRequestOptionsId(requestOptions)}${stateOverrideKey}`,
    wait: wait2,
    shouldSplitBatch(args2) {
      const size5 = args2.reduce((size6, { data: data2 }) => size6 + (data2.length - 2), 0);
      return size5 > batchSize * 2;
    },
    fn: async (requests) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to
      }));
      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3"
      });
      const multicallRequest = {
        ...multicallAddress === null ? {
          data: toDeploylessCallViaBytecodeData({
            code: multicall3Bytecode,
            data: calldata
          })
        } : { to: multicallAddress, data: calldata }
      };
      const data2 = await client.request({
        method: "eth_call",
        params: rpcStateOverride ? [multicallRequest, block, rpcStateOverride] : [multicallRequest, block]
      }, requestOptions);
      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3",
        data: data2 || "0x"
      });
    }
  });
  const [{ returnData, success }] = await schedule({ data, to });
  if (!success)
    throw new RawContractError({ data: returnData });
  if (returnData === "0x")
    return { data: void 0 };
  return { data: returnData };
}
function getMulticallAddress(client, parameters) {
  const { blockNumber, deployless } = parameters;
  if (deployless)
    return null;
  if (client.chain)
    return getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  throw new ClientChainNotConfiguredError();
}
function hasStateOverrideForAddress(rpcStateOverride, address) {
  if (!rpcStateOverride)
    return false;
  return Object.keys(rpcStateOverride).some((stateOverrideAddress) => isAddressEqual(stateOverrideAddress, address));
}
function toDeploylessCallViaBytecodeData(parameters) {
  const { code, data } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(bytes, bytes)"]),
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data]
  });
}
function toDeploylessCallViaFactoryData(parameters) {
  const { data, factory, factoryData, to } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory, factoryData]
  });
}
function getRevertErrorData(err) {
  if (!(err instanceof BaseError2))
    return void 0;
  const error = err.walk();
  return typeof error?.data === "object" ? error.data?.data : error.data;
}
var requestOptionsId, requestOptionsIds;
var init_call = __esm({
  "node_modules/viem/_esm/actions/public/call.js"() {
    init_exports();
    init_BlockOverrides();
    init_parseAccount();
    init_abis();
    init_contract2();
    init_contracts();
    init_base();
    init_chain();
    init_contract();
    init_utils3();
    init_decodeFunctionResult();
    init_encodeDeployData();
    init_encodeFunctionData();
    init_isAddressEqual();
    init_formatBlockParameter();
    init_getChainContractAddress();
    init_getCallError();
    init_extract();
    init_transactionRequest();
    init_createBatchScheduler();
    init_stateOverride2();
    init_assertRequest();
    __name(call, "call");
    __name(shouldPerformMulticall, "shouldPerformMulticall");
    requestOptionsId = 0;
    requestOptionsIds = /* @__PURE__ */ new WeakMap();
    __name(getRequestOptionsId, "getRequestOptionsId");
    __name(scheduleMulticall, "scheduleMulticall");
    __name(getMulticallAddress, "getMulticallAddress");
    __name(hasStateOverrideForAddress, "hasStateOverrideForAddress");
    __name(toDeploylessCallViaBytecodeData, "toDeploylessCallViaBytecodeData");
    __name(toDeploylessCallViaFactoryData, "toDeploylessCallViaFactoryData");
    __name(getRevertErrorData, "getRevertErrorData");
  }
});

// node_modules/viem/_esm/actions/public/readContract.js
async function readContract(client, parameters) {
  const { abi: abi2, address, args, functionName, ...rest } = parameters;
  const calldata = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const { data } = await getAction(client, call, "call")({
      ...rest,
      data: calldata,
      to: address
    });
    return decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/readContract",
      functionName
    });
  }
}
var init_readContract = __esm({
  "node_modules/viem/_esm/actions/public/readContract.js"() {
    init_decodeFunctionResult();
    init_encodeFunctionData();
    init_getContractError();
    init_getAction();
    init_call();
    __name(readContract, "readContract");
  }
});

// node_modules/viem/_esm/actions/public/simulateContract.js
async function simulateContract(client, parameters) {
  const { abi: abi2, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...callRequest } = parameters;
  const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
  const calldata = encodeFunctionData({ abi: abi2, args, functionName });
  try {
    const { data } = await getAction(client, call, "call")({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...callRequest,
      account
    });
    const result = decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
    const minimizedAbi = abi2.filter((abiItem) => "name" in abiItem && abiItem.name === parameters.functionName);
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
        account
      }
    };
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/simulateContract",
      functionName,
      sender: account?.address
    });
  }
}
var init_simulateContract = __esm({
  "node_modules/viem/_esm/actions/public/simulateContract.js"() {
    init_parseAccount();
    init_decodeFunctionResult();
    init_encodeFunctionData();
    init_getContractError();
    init_getAction();
    init_call();
    __name(simulateContract, "simulateContract");
  }
});

// node_modules/viem/_esm/utils/observe.js
function observe(observerId, callbacks, fn) {
  const callbackId = ++callbackCount;
  const getListeners = /* @__PURE__ */ __name(() => listenersCache.get(observerId) || [], "getListeners");
  const unsubscribe = /* @__PURE__ */ __name(() => {
    const listeners2 = getListeners();
    const nextListeners = listeners2.filter((cb) => cb.id !== callbackId);
    if (nextListeners.length === 0) {
      listenersCache.delete(observerId);
      cleanupCache.delete(observerId);
      return;
    }
    listenersCache.set(observerId, nextListeners);
  }, "unsubscribe");
  const unwatch = /* @__PURE__ */ __name(() => {
    const listeners2 = getListeners();
    if (!listeners2.some((cb) => cb.id === callbackId))
      return;
    const cleanup2 = cleanupCache.get(observerId);
    if (listeners2.length === 1 && cleanup2) {
      const p = cleanup2();
      if (p instanceof Promise)
        p.catch(() => {
        });
    }
    unsubscribe();
  }, "unwatch");
  const listeners = getListeners();
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks }
  ]);
  if (listeners && listeners.length > 0)
    return unwatch;
  const emit = {};
  for (const key in callbacks) {
    emit[key] = (...args) => {
      const listeners2 = getListeners();
      if (listeners2.length === 0)
        return;
      for (const listener of listeners2)
        listener.fns[key]?.(...args);
    };
  }
  const cleanup = fn(emit);
  if (typeof cleanup === "function")
    cleanupCache.set(observerId, cleanup);
  return unwatch;
}
var listenersCache, cleanupCache, callbackCount;
var init_observe = __esm({
  "node_modules/viem/_esm/utils/observe.js"() {
    listenersCache = /* @__PURE__ */ new Map();
    cleanupCache = /* @__PURE__ */ new Map();
    callbackCount = 0;
    __name(observe, "observe");
  }
});

// node_modules/viem/_esm/utils/wait.js
async function wait(time, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal));
      return;
    }
    const cleanup = /* @__PURE__ */ __name(() => signal?.removeEventListener("abort", onAbort), "cleanup");
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, time);
    const onAbort = /* @__PURE__ */ __name(() => {
      clearTimeout(timeout);
      cleanup();
      reject(getAbortError(signal));
    }, "onAbort");
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
var init_wait = __esm({
  "node_modules/viem/_esm/utils/wait.js"() {
    init_utils3();
    __name(wait, "wait");
  }
});

// node_modules/viem/_esm/utils/poll.js
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
  let active = true;
  const unwatch = /* @__PURE__ */ __name(() => active = false, "unwatch");
  const watch = /* @__PURE__ */ __name(async () => {
    let data;
    if (emitOnBegin)
      data = await fn({ unpoll: unwatch });
    const initialWait = await initialWaitTime?.(data) ?? interval;
    await wait(initialWait);
    const poll2 = /* @__PURE__ */ __name(async () => {
      if (!active)
        return;
      await fn({ unpoll: unwatch });
      await wait(interval);
      poll2();
    }, "poll");
    poll2();
  }, "watch");
  watch();
  return unwatch;
}
var init_poll = __esm({
  "node_modules/viem/_esm/utils/poll.js"() {
    init_wait();
    __name(poll, "poll");
  }
});

// node_modules/viem/_esm/utils/promise/withCache.js
function getCache(cacheKey2) {
  const buildCache = /* @__PURE__ */ __name((cacheKey3, cache) => ({
    clear: () => cache.delete(cacheKey3),
    get: () => cache.get(cacheKey3),
    set: (data) => cache.set(cacheKey3, data)
  }), "buildCache");
  const promise = buildCache(cacheKey2, promiseCache);
  const response = buildCache(cacheKey2, responseCache);
  return {
    clear: () => {
      promise.clear();
      response.clear();
    },
    promise,
    response
  };
}
async function withCache(fn, { cacheKey: cacheKey2, cacheTime = Number.POSITIVE_INFINITY }) {
  const cache = getCache(cacheKey2);
  const response = cache.response.get();
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created.getTime();
    if (age < cacheTime)
      return response.data;
  }
  let promise = cache.promise.get();
  if (!promise) {
    promise = fn();
    cache.promise.set(promise);
  }
  try {
    const data = await promise;
    cache.response.set({ created: /* @__PURE__ */ new Date(), data });
    return data;
  } finally {
    cache.promise.clear();
  }
}
var promiseCache, responseCache;
var init_withCache = __esm({
  "node_modules/viem/_esm/utils/promise/withCache.js"() {
    promiseCache = /* @__PURE__ */ new Map();
    responseCache = /* @__PURE__ */ new Map();
    __name(getCache, "getCache");
    __name(withCache, "withCache");
  }
});

// node_modules/viem/_esm/actions/public/getBlockNumber.js
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
  const blockNumberHex = await withCache(() => client.request({
    method: "eth_blockNumber"
  }), { cacheKey: cacheKey(client.uid), cacheTime });
  return BigInt(blockNumberHex);
}
var cacheKey;
var init_getBlockNumber = __esm({
  "node_modules/viem/_esm/actions/public/getBlockNumber.js"() {
    init_withCache();
    cacheKey = /* @__PURE__ */ __name((id) => `blockNumber.${id}`, "cacheKey");
    __name(getBlockNumber, "getBlockNumber");
  }
});

// node_modules/viem/_esm/actions/public/getFilterChanges.js
async function getFilterChanges(_client, { filter }) {
  const strict = "strict" in filter && filter.strict;
  const logs = await filter.request({
    method: "eth_getFilterChanges",
    params: [filter.id]
  });
  if (typeof logs[0] === "string")
    return logs;
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!("abi" in filter) || !filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
var init_getFilterChanges = __esm({
  "node_modules/viem/_esm/actions/public/getFilterChanges.js"() {
    init_parseEventLogs();
    init_log2();
    __name(getFilterChanges, "getFilterChanges");
  }
});

// node_modules/viem/_esm/actions/public/uninstallFilter.js
async function uninstallFilter(_client, { filter }) {
  return filter.request({
    method: "eth_uninstallFilter",
    params: [filter.id]
  });
}
var init_uninstallFilter = __esm({
  "node_modules/viem/_esm/actions/public/uninstallFilter.js"() {
    __name(uninstallFilter, "uninstallFilter");
  }
});

// node_modules/viem/_esm/actions/public/watchContractEvent.js
function watchContractEvent(client, parameters) {
  const { abi: abi2, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const pollContractEvent = /* @__PURE__ */ __name(() => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
              abi: abi2,
              address,
              args,
              eventName,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber < blockNumber) {
              logs = await getAction(client, getContractEvents, "getContractEvents")({
                abi: abi2,
                address,
                args,
                eventName,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                strict
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollContractEvent");
  const subscribeContractEvent = /* @__PURE__ */ __name(() => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict
    ]);
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
    return observe(observerId, { onLogs, onError }, (emit) => {
      ;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const topics = eventName ? encodeEventTopics({
            abi: abi2,
            eventName,
            args
          }) : [];
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName: eventName2, args: args2 } = decodeEventLog({
                  abi: abi2,
                  data: log.data,
                  topics: log.topics,
                  strict: strict_
                });
                const formatted = formatLog(log, {
                  args: args2,
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              } catch (err) {
                let eventName2;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName2 = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              }
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  }, "subscribeContractEvent");
  return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
var init_watchContractEvent = __esm({
  "node_modules/viem/_esm/actions/public/watchContractEvent.js"() {
    init_abi();
    init_rpc();
    init_decodeEventLog();
    init_encodeEventTopics();
    init_log2();
    init_getAction();
    init_observe();
    init_poll();
    init_stringify();
    init_createContractEventFilter();
    init_getBlockNumber();
    init_getContractEvents();
    init_getFilterChanges();
    init_uninstallFilter();
    __name(watchContractEvent, "watchContractEvent");
  }
});

// node_modules/viem/_esm/errors/account.js
var AccountNotFoundError, AccountTypeNotSupportedError;
var init_account = __esm({
  "node_modules/viem/_esm/errors/account.js"() {
    init_base();
    AccountNotFoundError = class extends BaseError2 {
      constructor({ docsPath: docsPath8 } = {}) {
        super([
          "Could not find an Account to execute with this Action.",
          "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
        ].join("\n"), {
          docsPath: docsPath8,
          docsSlug: "account",
          name: "AccountNotFoundError"
        });
      }
    };
    __name(AccountNotFoundError, "AccountNotFoundError");
    AccountTypeNotSupportedError = class extends BaseError2 {
      constructor({ docsPath: docsPath8, metaMessages, type }) {
        super(`Account type "${type}" is not supported.`, {
          docsPath: docsPath8,
          metaMessages,
          name: "AccountTypeNotSupportedError"
        });
      }
    };
    __name(AccountTypeNotSupportedError, "AccountTypeNotSupportedError");
  }
});

// node_modules/viem/_esm/utils/chain/assertCurrentChain.js
function assertCurrentChain({ chain, currentChainId }) {
  if (!chain)
    throw new ChainNotFoundError();
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId });
}
var init_assertCurrentChain = __esm({
  "node_modules/viem/_esm/utils/chain/assertCurrentChain.js"() {
    init_chain();
    __name(assertCurrentChain, "assertCurrentChain");
  }
});

// node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
async function sendRawTransaction(client, { serializedTransaction }) {
  return client.request({
    method: "eth_sendRawTransaction",
    params: [serializedTransaction]
  }, { retryCount: 0 });
}
var init_sendRawTransaction = __esm({
  "node_modules/viem/_esm/actions/wallet/sendRawTransaction.js"() {
    __name(sendRawTransaction, "sendRawTransaction");
  }
});

// node_modules/viem/_esm/actions/wallet/sendTransaction.js
async function sendTransaction(client, parameters) {
  const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, type, value, ...rest } = parameters;
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction"
    });
  const account = account_ ? parseAccount(account_) : null;
  let nonceManagerParameters;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return void 0;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return void 0;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        if (assertChainId)
          assertCurrentChain({
            currentChainId: chainId,
            chain
          });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format2 = chainFormat || formatTransactionRequest;
      const request = format2({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      try {
        return await client.request({
          method,
          params: [request]
        }, { retryCount: 0 });
      } catch (e) {
        if (isWalletNamespaceSupported === false)
          throw e;
        const error = e;
        if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
          return await client.request({
            method: "wallet_sendTransaction",
            params: [request]
          }, { retryCount: 0 }).then((hash3) => {
            supportsWalletNamespace.set(client.uid, true);
            return hash3;
          }).catch((e2) => {
            const walletNamespaceError = e2;
            if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
              supportsWalletNamespace.set(client.uid, false);
              throw error;
            }
            throw walletNamespaceError;
          });
        }
        throw error;
      }
    }
    if (account?.type === "local") {
      const nonceManager = (() => {
        if (!account.nonceManager || typeof nonce !== "undefined")
          return account.nonceManager;
        const nonceManager2 = account.nonceManager;
        return {
          consume(parameters2) {
            nonceManagerParameters = {
              address: parameters2.address,
              chainId: parameters2.chainId
            };
            return nonceManager2.consume(parameters2);
          },
          get(parameters2) {
            return nonceManager2.get(parameters2);
          },
          increment(parameters2) {
            return nonceManager2.increment(parameters2);
          },
          reset(parameters2) {
            return nonceManager2.reset(parameters2);
          }
        };
      })();
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const signedTransaction = await account.signTransaction(request, {
        serializer
      });
      const transactionEnvelope = (chain ?? client.chain)?.serializers?.transactionEnvelope;
      const serializedTransaction = transactionEnvelope ? await transactionEnvelope({
        serializedTransaction: signedTransaction,
        transaction: request
      }) : signedTransaction;
      return await getAction(client, sendRawTransaction, "sendRawTransaction")({
        serializedTransaction
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransaction",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    if (nonceManagerParameters)
      account?.nonceManager?.reset(nonceManagerParameters);
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}
var supportsWalletNamespace;
var init_sendTransaction = __esm({
  "node_modules/viem/_esm/actions/wallet/sendTransaction.js"() {
    init_parseAccount();
    init_account();
    init_base();
    init_recoverAuthorizationAddress();
    init_assertCurrentChain();
    init_concat();
    init_getTransactionError();
    init_extract();
    init_transactionRequest();
    init_getAction();
    init_lru();
    init_assertRequest();
    init_getChainId();
    init_prepareTransactionRequest();
    init_sendRawTransaction();
    supportsWalletNamespace = new LruMap(128);
    __name(sendTransaction, "sendTransaction");
  }
});

// node_modules/viem/_esm/actions/wallet/writeContract.js
async function writeContract(client, parameters) {
  return writeContract.internal(client, sendTransaction, "sendTransaction", parameters);
}
var init_writeContract = __esm({
  "node_modules/viem/_esm/actions/wallet/writeContract.js"() {
    init_parseAccount();
    init_account();
    init_encodeFunctionData();
    init_getContractError();
    init_getAction();
    init_sendTransaction();
    __name(writeContract, "writeContract");
    (function(writeContract2) {
      async function internal(client, actionFn, name, parameters) {
        const { abi: abi2, account: account_ = client.account, address, args, functionName, ...request } = parameters;
        if (typeof account_ === "undefined")
          throw new AccountNotFoundError({
            docsPath: "/docs/contract/writeContract"
          });
        const account = account_ ? parseAccount(account_) : null;
        const data = encodeFunctionData({
          abi: abi2,
          args,
          functionName
        });
        try {
          return await getAction(client, actionFn, name)({
            data,
            to: address,
            account,
            ...request
          });
        } catch (error) {
          throw getContractError(error, {
            abi: abi2,
            address,
            args,
            docsPath: "/docs/contract/writeContract",
            functionName,
            sender: account?.address
          });
        }
      }
      __name(internal, "internal");
      writeContract2.internal = internal;
    })(writeContract || (writeContract = {}));
  }
});

// node_modules/viem/_esm/utils/promise/withRetry.js
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry: shouldRetry2 = /* @__PURE__ */ __name(() => true, "shouldRetry"), signal } = {}) {
  return new Promise((resolve, reject) => {
    const onAbort = /* @__PURE__ */ __name(() => reject(getAbortError(signal)), "onAbort");
    signal?.addEventListener("abort", onAbort, { once: true });
    const attemptRetry = /* @__PURE__ */ __name(async ({ count = 0 } = {}) => {
      if (signal?.aborted) {
        reject(getAbortError(signal));
        return;
      }
      const retry = /* @__PURE__ */ __name(async ({ error }) => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay) {
          try {
            await wait(delay, { signal });
          } catch (err) {
            reject(err);
            return;
          }
        }
        return attemptRetry({ count: count + 1 });
      }, "retry");
      try {
        const data = await fn();
        resolve(data);
      } catch (err) {
        if (signal?.aborted) {
          reject(getAbortError(signal));
          return;
        }
        if (isAbortError(err)) {
          reject(err);
          return;
        }
        if (count < retryCount && await shouldRetry2({ count, error: err }))
          return retry({ error: err });
        reject(err);
      }
    }, "attemptRetry");
    void attemptRetry().catch(reject).finally(() => signal?.removeEventListener("abort", onAbort));
  });
}
var init_withRetry = __esm({
  "node_modules/viem/_esm/utils/promise/withRetry.js"() {
    init_utils3();
    init_wait();
    __name(withRetry, "withRetry");
  }
});

// node_modules/viem/_esm/utils/formatters/transactionReceipt.js
function formatTransactionReceipt(transactionReceipt, _) {
  const receipt = {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
    contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
    gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
    logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
    status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
    type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
  };
  if (transactionReceipt.blobGasPrice)
    receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
  if (transactionReceipt.blobGasUsed)
    receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
  return receipt;
}
var receiptStatuses, defineTransactionReceipt;
var init_transactionReceipt = __esm({
  "node_modules/viem/_esm/utils/formatters/transactionReceipt.js"() {
    init_fromHex();
    init_formatter();
    init_log2();
    init_transaction2();
    receiptStatuses = {
      "0x0": "reverted",
      "0x1": "success"
    };
    __name(formatTransactionReceipt, "formatTransactionReceipt");
    defineTransactionReceipt = /* @__PURE__ */ defineFormatter("transactionReceipt", formatTransactionReceipt);
  }
});

// node_modules/viem/_esm/utils/transaction/assertTransaction.js
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { chainId } = authorization;
      const address = authorization.address;
      if (!isAddress(address))
        throw new InvalidAddressError({ address });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError();
    for (const hash3 of blobVersionedHashes) {
      const size_ = size(hash3);
      const version4 = hexToNumber(slice(hash3, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash: hash3, size: size_ });
      if (version4 !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash: hash3,
          version: version4
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
var init_assertTransaction = __esm({
  "node_modules/viem/_esm/utils/transaction/assertTransaction.js"() {
    init_kzg();
    init_number();
    init_address();
    init_base();
    init_blob2();
    init_chain();
    init_node();
    init_isAddress();
    init_size();
    init_slice();
    init_fromHex();
    __name(assertTransactionEIP7702, "assertTransactionEIP7702");
    __name(assertTransactionEIP4844, "assertTransactionEIP4844");
    __name(assertTransactionEIP1559, "assertTransactionEIP1559");
    __name(assertTransactionEIP2930, "assertTransactionEIP2930");
    __name(assertTransactionLegacy, "assertTransactionLegacy");
  }
});

// node_modules/viem/_esm/utils/transaction/serializeAccessList.js
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}
var init_serializeAccessList = __esm({
  "node_modules/viem/_esm/utils/transaction/serializeAccessList.js"() {
    init_address();
    init_transaction();
    init_isAddress();
    __name(serializeAccessList, "serializeAccessList");
  }
});

// node_modules/viem/_esm/utils/transaction/serializeTransaction.js
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0; i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? (
      // If sidecars are enabled, envelope turns into a "wrapper":
      toRlp([serializedTransaction, blobs, commitments, proofs])
    ) : (
      // If sidecars are disabled, standard envelope is used:
      toRlp(serializedTransaction)
    )
  ]);
}
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? numberToHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return numberToHex(1);
    return v === 27n ? "0x" : numberToHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}
var init_serializeTransaction = __esm({
  "node_modules/viem/_esm/utils/transaction/serializeTransaction.js"() {
    init_transaction();
    init_serializeAuthorizationList();
    init_blobsToCommitments();
    init_blobsToProofs();
    init_commitmentsToVersionedHashes();
    init_toBlobSidecars();
    init_concat();
    init_trim();
    init_toHex();
    init_toRlp();
    init_assertTransaction();
    init_getTransactionType();
    init_serializeAccessList();
    __name(serializeTransaction, "serializeTransaction");
    __name(serializeTransactionEIP7702, "serializeTransactionEIP7702");
    __name(serializeTransactionEIP4844, "serializeTransactionEIP4844");
    __name(serializeTransactionEIP1559, "serializeTransactionEIP1559");
    __name(serializeTransactionEIP2930, "serializeTransactionEIP2930");
    __name(serializeTransactionLegacy, "serializeTransactionLegacy");
    __name(toYParitySignatureArray, "toYParitySignatureArray");
  }
});

// node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { chainId, nonce, ...signature } = authorization;
    const contractAddress = authorization.address;
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...toYParitySignatureArray({}, signature)
    ]);
  }
  return serializedAuthorizationList;
}
var init_serializeAuthorizationList = __esm({
  "node_modules/viem/_esm/utils/authorization/serializeAuthorizationList.js"() {
    init_toHex();
    init_serializeTransaction();
    __name(serializeAuthorizationList, "serializeAuthorizationList");
  }
});

// node_modules/viem/_esm/utils/authorization/verifyAuthorization.js
async function verifyAuthorization({ address, authorization, signature }) {
  return isAddressEqual(getAddress(address), await recoverAuthorizationAddress({
    authorization,
    signature
  }));
}
var init_verifyAuthorization = __esm({
  "node_modules/viem/_esm/utils/authorization/verifyAuthorization.js"() {
    init_getAddress();
    init_isAddressEqual();
    init_recoverAuthorizationAddress();
    __name(verifyAuthorization, "verifyAuthorization");
  }
});

// node_modules/viem/_esm/utils/promise/withDedupe.js
function withDedupe(fn, { enabled = true, id }) {
  if (!enabled || !id)
    return fn();
  if (promiseCache2.get(id))
    return promiseCache2.get(id);
  const promise = fn().finally(() => promiseCache2.delete(id));
  promiseCache2.set(id, promise);
  return promise;
}
var promiseCache2;
var init_withDedupe = __esm({
  "node_modules/viem/_esm/utils/promise/withDedupe.js"() {
    init_lru();
    promiseCache2 = /* @__PURE__ */ new LruMap(8192);
    __name(withDedupe, "withDedupe");
  }
});

// node_modules/viem/_esm/utils/buildRequest.js
function buildRequest(request, options = {}) {
  return async (args, overrideOptions = {}) => {
    const { dedupe = false, methods, retryDelay = 150, retryCount = 3, signal, uid: uid2 } = {
      ...options,
      ...overrideOptions
    };
    const { method } = args;
    if (methods?.exclude?.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (methods?.include && !methods.include.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (signal?.aborted)
      throw getAbortError(signal);
    const requestId = dedupe ? hashString(`${uid2}.${stringify(args)}`) : void 0;
    return withDedupe(() => withRetry(async () => {
      try {
        return await request(args, signal ? { signal } : void 0);
      } catch (err_) {
        if (signal?.aborted)
          throw getAbortError(signal);
        if (isAbortError(err_))
          throw err_;
        const err = err_;
        switch (err.code) {
          case ParseRpcError.code:
            throw new ParseRpcError(err);
          case InvalidRequestRpcError.code:
            throw new InvalidRequestRpcError(err);
          case MethodNotFoundRpcError.code:
            throw new MethodNotFoundRpcError(err, { method: args.method });
          case InvalidParamsRpcError.code:
            throw new InvalidParamsRpcError(err);
          case InternalRpcError.code:
            throw new InternalRpcError(err);
          case InvalidInputRpcError.code:
            throw new InvalidInputRpcError(err);
          case ResourceNotFoundRpcError.code:
            throw new ResourceNotFoundRpcError(err);
          case ResourceUnavailableRpcError.code:
            throw new ResourceUnavailableRpcError(err);
          case TransactionRejectedRpcError.code:
            throw new TransactionRejectedRpcError(err);
          case MethodNotSupportedRpcError.code:
            throw new MethodNotSupportedRpcError(err, {
              method: args.method
            });
          case LimitExceededRpcError.code:
            throw new LimitExceededRpcError(err);
          case JsonRpcVersionUnsupportedError.code:
            throw new JsonRpcVersionUnsupportedError(err);
          case UserRejectedRequestError.code:
            throw new UserRejectedRequestError(err);
          case UnauthorizedProviderError.code:
            throw new UnauthorizedProviderError(err);
          case UnsupportedProviderMethodError.code:
            throw new UnsupportedProviderMethodError(err);
          case ProviderDisconnectedError.code:
            throw new ProviderDisconnectedError(err);
          case ChainDisconnectedError.code:
            throw new ChainDisconnectedError(err);
          case SwitchChainError.code:
            throw new SwitchChainError(err);
          case UnsupportedNonOptionalCapabilityError.code:
            throw new UnsupportedNonOptionalCapabilityError(err);
          case UnsupportedChainIdError.code:
            throw new UnsupportedChainIdError(err);
          case DuplicateIdError.code:
            throw new DuplicateIdError(err);
          case UnknownBundleIdError.code:
            throw new UnknownBundleIdError(err);
          case BundleTooLargeError.code:
            throw new BundleTooLargeError(err);
          case AtomicReadyWalletRejectedUpgradeError.code:
            throw new AtomicReadyWalletRejectedUpgradeError(err);
          case AtomicityNotSupportedError.code:
            throw new AtomicityNotSupportedError(err);
          case 5e3:
            throw new UserRejectedRequestError(err);
          case WalletConnectSessionSettlementError.code:
            throw new WalletConnectSessionSettlementError(err);
          default:
            if (err_ instanceof BaseError2)
              throw err_;
            throw new UnknownRpcError(err);
        }
      }
    }, {
      delay: ({ count, error }) => {
        if (error && error instanceof HttpRequestError) {
          const retryAfter = error?.headers?.get("Retry-After");
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter, 10) * 1e3;
        }
        return ~~(1 << count) * retryDelay;
      },
      retryCount,
      signal,
      shouldRetry: ({ error }) => shouldRetry(error)
    }), { enabled: dedupe, id: requestId });
  };
}
function shouldRetry(error) {
  if (isAbortError(error))
    return false;
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    if (error.code === 429)
      return true;
    if (error.code === -32007)
      return true;
    return false;
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}
function hashString(str, seed = 0) {
  let h1 = 3735928559 ^ seed;
  let h2 = 1103547991 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 16, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 16, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
var init_buildRequest = __esm({
  "node_modules/viem/_esm/utils/buildRequest.js"() {
    init_base();
    init_request();
    init_rpc();
    init_utils3();
    init_withDedupe();
    init_withRetry();
    init_stringify();
    __name(buildRequest, "buildRequest");
    __name(shouldRetry, "shouldRetry");
    __name(hashString, "hashString");
  }
});

// node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
  const chainInstance = {
    formatters: void 0,
    fees: void 0,
    serializers: void 0,
    ...chain
  };
  function extend(base2) {
    return (fnOrExtended) => {
      const properties = typeof fnOrExtended === "function" ? fnOrExtended(base2) : fnOrExtended;
      const combined = { ...base2, ...properties };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  __name(extend, "extend");
  return Object.assign(chainInstance, {
    extend: extend(chainInstance)
  });
}
var init_defineChain = __esm({
  "node_modules/viem/_esm/utils/chain/defineChain.js"() {
    __name(defineChain, "defineChain");
  }
});

// node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn, { errorInstance = new Error("timed out"), timeout, signal }) {
  return new Promise((resolve, reject) => {
    ;
    (async () => {
      let timeoutId;
      const controller = new AbortController();
      try {
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort();
            } else {
              reject(errorInstance);
            }
          }, timeout);
        }
        resolve(await fn({ signal: controller?.signal || null }));
      } catch (err) {
        if (controller?.signal.aborted && isAbortError(err)) {
          reject(errorInstance);
          return;
        }
        reject(err);
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  });
}
var init_withTimeout = __esm({
  "node_modules/viem/_esm/utils/promise/withTimeout.js"() {
    init_utils3();
    __name(withTimeout, "withTimeout");
  }
});

// node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++;
    },
    reset() {
      this.current = 0;
    }
  };
}
var idCache;
var init_id = __esm({
  "node_modules/viem/_esm/utils/rpc/id.js"() {
    __name(createIdStore, "createIdStore");
    idCache = /* @__PURE__ */ createIdStore();
  }
});

// node_modules/viem/_esm/utils/rpc/http.js
function getHttpRpcClient(url_, options = {}) {
  const { url, headers: headers_url } = parseUrl(url_);
  return {
    async request(params) {
      const { body, fetchFn = options.fetchFn ?? fetch, maxResponseBodySize = options.maxResponseBodySize ?? defaultMaxResponseBodySize, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
      const fetchOptions = {
        ...options.fetchOptions ?? {},
        ...params.fetchOptions ?? {}
      };
      const { headers, method, signal: signal_ } = fetchOptions;
      try {
        const { response, responseBody } = await withTimeout(async ({ signal: timeoutSignal }) => {
          const { signal, cleanup } = anySignal([
            signal_,
            timeout > 0 ? timeoutSignal : null
          ]);
          try {
            const init = {
              ...fetchOptions,
              body: Array.isArray(body) ? stringify(body.map((body2) => ({
                jsonrpc: "2.0",
                id: body2.id ?? idCache.take(),
                ...body2
              }))) : stringify({
                jsonrpc: "2.0",
                id: body.id ?? idCache.take(),
                ...body
              }),
              headers: {
                ...headers_url,
                "Content-Type": "application/json",
                ...headers
              },
              method: method || "POST",
              signal
            };
            const request = new Request(url, init);
            const args = await onRequest?.(request, init) ?? {
              ...init,
              url
            };
            const response2 = await fetchFn(args.url ?? url, args);
            if (onResponse)
              await onResponse(response2);
            const responseBody2 = await readResponseBody(response2, {
              maxResponseBodySize
            });
            return { response: response2, responseBody: responseBody2 };
          } finally {
            cleanup();
          }
        }, {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true
        });
        let data;
        if (response.headers.get("Content-Type")?.startsWith("application/json"))
          data = JSON.parse(responseBody);
        else {
          data = responseBody;
          try {
            data = JSON.parse(data || "{}");
          } catch (err) {
            if (response.ok)
              throw err;
            data = { error: data };
          }
        }
        if (!response.ok) {
          if (typeof data.error?.code === "number" && typeof data.error?.message === "string")
            return data;
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
        }
        return data;
      } catch (err) {
        if (signal_?.aborted)
          throw getAbortError(signal_);
        if (isAbortError(err))
          throw err;
        if (err instanceof HttpRequestError)
          throw err;
        if (err instanceof ResponseBodyTooLargeError)
          throw err;
        if (err instanceof TimeoutError)
          throw err;
        throw new HttpRequestError({
          body,
          cause: err,
          url
        });
      }
    }
  };
}
function anySignal(signals) {
  const signals_ = signals.filter((signal) => !!signal);
  if (signals_.length < 2)
    return { signal: signals_[0] ?? null, cleanup: () => {
    } };
  const controller = new AbortController();
  const onAbort = /* @__PURE__ */ __name(() => {
    cleanup();
    controller.abort(signals_.find((signal) => signal.aborted)?.reason);
  }, "onAbort");
  const cleanup = /* @__PURE__ */ __name(() => {
    for (const signal of signals_)
      signal.removeEventListener("abort", onAbort);
  }, "cleanup");
  for (const signal of signals_) {
    if (signal.aborted) {
      cleanup();
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", onAbort);
  }
  return { signal: controller.signal, cleanup };
}
async function readResponseBody(response, { maxResponseBodySize }) {
  if (maxResponseBodySize === false)
    return response.text();
  const contentLength = response.headers.get("Content-Length");
  if (contentLength) {
    const size6 = Number(contentLength);
    if (size6 > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size: size6
      });
  }
  if (!response.body) {
    const body2 = await response.text();
    const size6 = new TextEncoder().encode(body2).length;
    if (size6 > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size: size6
      });
    return body2;
  }
  const reader = response.body.getReader();
  const decoder2 = new TextDecoder();
  let body = "";
  let size5 = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      size5 += value.byteLength;
      if (size5 > maxResponseBodySize) {
        await reader.cancel();
        throw new ResponseBodyTooLargeError({
          maxSize: maxResponseBodySize,
          size: size5
        });
      }
      body += decoder2.decode(value, { stream: true });
    }
    body += decoder2.decode();
    return body;
  } finally {
    reader.releaseLock();
  }
}
function parseUrl(url_) {
  try {
    const url = new URL(url_);
    const result = (() => {
      if (url.username) {
        const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
        url.username = "";
        url.password = "";
        return {
          url: url.toString(),
          headers: { Authorization: `Basic ${btoa(credentials)}` }
        };
      }
      return;
    })();
    return { url: url.toString(), ...result };
  } catch {
    return { url: url_ };
  }
}
var defaultMaxResponseBodySize;
var init_http = __esm({
  "node_modules/viem/_esm/utils/rpc/http.js"() {
    init_request();
    init_utils3();
    init_withTimeout();
    init_stringify();
    init_id();
    defaultMaxResponseBodySize = 10485760;
    __name(getHttpRpcClient, "getHttpRpcClient");
    __name(anySignal, "anySignal");
    __name(readResponseBody, "readResponseBody");
    __name(parseUrl, "parseUrl");
  }
});

// node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix;
var init_strings = __esm({
  "node_modules/viem/_esm/constants/strings.js"() {
    presignMessagePrefix = "Ethereum Signed Message:\n";
  }
});

// node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}
var init_toPrefixedMessage = __esm({
  "node_modules/viem/_esm/utils/signature/toPrefixedMessage.js"() {
    init_strings();
    init_concat();
    init_size();
    init_toHex();
    __name(toPrefixedMessage, "toPrefixedMessage");
  }
});

// node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}
var init_hashMessage = __esm({
  "node_modules/viem/_esm/utils/signature/hashMessage.js"() {
    init_keccak256();
    init_toPrefixedMessage();
    __name(hashMessage, "hashMessage");
  }
});

// node_modules/viem/_esm/errors/typedData.js
var InvalidDomainError, InvalidPrimaryTypeError, InvalidStructTypeError, InvalidTypedDataTypeError;
var init_typedData = __esm({
  "node_modules/viem/_esm/errors/typedData.js"() {
    init_stringify();
    init_base();
    InvalidDomainError = class extends BaseError2 {
      constructor({ domain }) {
        super(`Invalid domain "${stringify(domain)}".`, {
          metaMessages: ["Must be a valid EIP-712 domain."]
        });
      }
    };
    __name(InvalidDomainError, "InvalidDomainError");
    InvalidPrimaryTypeError = class extends BaseError2 {
      constructor({ primaryType, types }) {
        super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
          docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
          metaMessages: ["Check that the primary type is a key in `types`."]
        });
      }
    };
    __name(InvalidPrimaryTypeError, "InvalidPrimaryTypeError");
    InvalidStructTypeError = class extends BaseError2 {
      constructor({ type }) {
        super(`Struct type "${type}" is invalid.`, {
          metaMessages: ["Struct type must not be a Solidity type."],
          name: "InvalidStructTypeError"
        });
      }
    };
    __name(InvalidStructTypeError, "InvalidStructTypeError");
    InvalidTypedDataTypeError = class extends BaseError2 {
      constructor({ type }) {
        const canonicalType = type.replace(/^(u?int)/, "$&256");
        super(`Type "${type}" is not a valid EIP-712 type.`, {
          metaMessages: [`Use "${canonicalType}" instead.`],
          name: "InvalidTypedDataTypeError"
        });
      }
    };
    __name(InvalidTypedDataTypeError, "InvalidTypedDataTypeError");
  }
});

// node_modules/viem/_esm/utils/typedData.js
function serializeTypedData(parameters) {
  const { domain: domain_, message: message_, primaryType, types } = parameters;
  const normalizeData = /* @__PURE__ */ __name((struct, data_) => {
    const data = { ...data_ };
    for (const param of struct) {
      const { name, type } = param;
      if (type === "address")
        data[name] = data[name].toLowerCase();
    }
    return data;
  }, "normalizeData");
  const domain = (() => {
    if (!types.EIP712Domain)
      return {};
    if (!domain_)
      return {};
    return normalizeData(types.EIP712Domain, domain_);
  })();
  const message = (() => {
    if (primaryType === "EIP712Domain")
      return void 0;
    return normalizeData(types[primaryType], message_);
  })();
  return stringify({ domain, message, primaryType, types });
}
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = /* @__PURE__ */ __name((struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const baseType = type.replace(/(\[[0-9]*\])+$/, "");
      if (baseType === "int" || baseType === "uint")
        throw new InvalidTypedDataTypeError({ type });
      const integerMatch = type.match(integerRegex2);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base2, size_] = integerMatch;
        numberToHex(value, {
          signed: base2 === "int",
          size: Number.parseInt(size_, 10) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex2);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_, 10))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_, 10),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2) {
        validateReference(type);
        validateData(struct2, value);
      }
    }
  }, "validateData");
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    typeof domain?.version === "string" && { name: "version", type: "string" },
    (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
function validateReference(type) {
  if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
    throw new InvalidStructTypeError({ type });
}
var init_typedData2 = __esm({
  "node_modules/viem/_esm/utils/typedData.js"() {
    init_abi();
    init_address();
    init_typedData();
    init_isAddress();
    init_size();
    init_toHex();
    init_regex2();
    init_stringify();
    __name(serializeTypedData, "serializeTypedData");
    __name(validateTypedData, "validateTypedData");
    __name(getTypesForEIP712Domain, "getTypesForEIP712Domain");
    __name(validateReference, "validateReference");
  }
});

// node_modules/viem/_esm/utils/signature/hashTypedData.js
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0];
  if (results.has(primaryType) || types[primaryType] === void 0) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== void 0) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes")
    return [{ type: "bytes32" }, keccak256(value)];
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}
var init_hashTypedData = __esm({
  "node_modules/viem/_esm/utils/signature/hashTypedData.js"() {
    init_encodeAbiParameters();
    init_concat();
    init_toHex();
    init_keccak256();
    init_typedData2();
    __name(hashTypedData, "hashTypedData");
    __name(hashDomain, "hashDomain");
    __name(hashStruct, "hashStruct");
    __name(encodeData, "encodeData");
    __name(hashType, "hashType");
    __name(encodeType, "encodeType");
    __name(findTypeDependencies, "findTypeDependencies");
    __name(encodeField, "encodeField");
  }
});

// node_modules/ox/_esm/core/internal/lru.js
var LruMap2;
var init_lru2 = __esm({
  "node_modules/ox/_esm/core/internal/lru.js"() {
    LruMap2 = class extends Map {
      constructor(size5) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size5;
      }
      get(key) {
        const value = super.get(key);
        if (super.has(key) && value !== void 0) {
          this.delete(key);
          super.set(key, value);
        }
        return value;
      }
      set(key, value) {
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize) {
          const firstKey = this.keys().next().value;
          if (firstKey)
            this.delete(firstKey);
        }
        return this;
      }
    };
    __name(LruMap2, "LruMap");
  }
});

// node_modules/ox/_esm/core/Caches.js
var caches, checksum;
var init_Caches = __esm({
  "node_modules/ox/_esm/core/Caches.js"() {
    init_lru2();
    caches = {
      checksum: /* @__PURE__ */ new LruMap2(8192)
    };
    checksum = caches.checksum;
  }
});

// node_modules/ox/_esm/core/Hash.js
function keccak2562(value, options = {}) {
  const { as = typeof value === "string" ? "Hex" : "Bytes" } = options;
  const bytes = keccak_256(from2(value));
  if (as === "Bytes")
    return bytes;
  return fromBytes(bytes);
}
var init_Hash = __esm({
  "node_modules/ox/_esm/core/Hash.js"() {
    init_sha3();
    init_Bytes();
    init_Hex();
    __name(keccak2562, "keccak256");
  }
});

// node_modules/ox/_esm/core/PublicKey.js
function assert3(publicKey, options = {}) {
  const { compressed } = options;
  const { prefix, x, y } = publicKey;
  if (compressed === false || typeof x === "bigint" && typeof y === "bigint") {
    if (prefix !== 4)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidUncompressedPrefixError()
      });
    return;
  }
  if (compressed === true || typeof x === "bigint" && typeof y === "undefined") {
    if (prefix !== 3 && prefix !== 2)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidCompressedPrefixError()
      });
    return;
  }
  throw new InvalidError({ publicKey });
}
function from4(value) {
  const publicKey = (() => {
    if (validate2(value))
      return fromHex2(value);
    if (validate(value))
      return fromBytes2(value);
    const { prefix, x, y } = value;
    if (typeof x === "bigint" && typeof y === "bigint")
      return { prefix: prefix ?? 4, x, y };
    return { prefix, x };
  })();
  assert3(publicKey);
  return publicKey;
}
function fromBytes2(publicKey) {
  return fromHex2(fromBytes(publicKey));
}
function fromHex2(publicKey) {
  if (publicKey.length !== 132 && publicKey.length !== 130 && publicKey.length !== 68)
    throw new InvalidSerializedSizeError({ publicKey });
  if (publicKey.length === 130) {
    const x2 = BigInt(slice3(publicKey, 0, 32));
    const y = BigInt(slice3(publicKey, 32, 64));
    return {
      prefix: 4,
      x: x2,
      y
    };
  }
  if (publicKey.length === 132) {
    const prefix2 = Number(slice3(publicKey, 0, 1));
    const x2 = BigInt(slice3(publicKey, 1, 33));
    const y = BigInt(slice3(publicKey, 33, 65));
    return {
      prefix: prefix2,
      x: x2,
      y
    };
  }
  const prefix = Number(slice3(publicKey, 0, 1));
  const x = BigInt(slice3(publicKey, 1, 33));
  return {
    prefix,
    x
  };
}
function toHex2(publicKey, options = {}) {
  assert3(publicKey);
  const { prefix, x, y } = publicKey;
  const { includePrefix = true } = options;
  const publicKey_ = concat2(
    includePrefix ? fromNumber(prefix, { size: 1 }) : "0x",
    fromNumber(x, { size: 32 }),
    // If the public key is not compressed, add the y coordinate.
    typeof y === "bigint" ? fromNumber(y, { size: 32 }) : "0x"
  );
  return publicKey_;
}
var InvalidError, InvalidPrefixError, InvalidCompressedPrefixError, InvalidUncompressedPrefixError, InvalidSerializedSizeError;
var init_PublicKey = __esm({
  "node_modules/ox/_esm/core/PublicKey.js"() {
    init_Bytes();
    init_Errors();
    init_Hex();
    init_Json();
    __name(assert3, "assert");
    __name(from4, "from");
    __name(fromBytes2, "fromBytes");
    __name(fromHex2, "fromHex");
    __name(toHex2, "toHex");
    InvalidError = class extends BaseError3 {
      constructor({ publicKey }) {
        super(`Value \`${stringify2(publicKey)}\` is not a valid public key.`, {
          metaMessages: [
            "Public key must contain:",
            "- an `x` and `prefix` value (compressed)",
            "- an `x`, `y`, and `prefix` value (uncompressed)"
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PublicKey.InvalidError"
        });
      }
    };
    __name(InvalidError, "InvalidError");
    InvalidPrefixError = class extends BaseError3 {
      constructor({ prefix, cause }) {
        super(`Prefix "${prefix}" is invalid.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PublicKey.InvalidPrefixError"
        });
      }
    };
    __name(InvalidPrefixError, "InvalidPrefixError");
    InvalidCompressedPrefixError = class extends BaseError3 {
      constructor() {
        super("Prefix must be 2 or 3 for compressed public keys.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PublicKey.InvalidCompressedPrefixError"
        });
      }
    };
    __name(InvalidCompressedPrefixError, "InvalidCompressedPrefixError");
    InvalidUncompressedPrefixError = class extends BaseError3 {
      constructor() {
        super("Prefix must be 4 for uncompressed public keys.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PublicKey.InvalidUncompressedPrefixError"
        });
      }
    };
    __name(InvalidUncompressedPrefixError, "InvalidUncompressedPrefixError");
    InvalidSerializedSizeError = class extends BaseError3 {
      constructor({ publicKey }) {
        super(`Value \`${publicKey}\` is an invalid public key size.`, {
          metaMessages: [
            "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
            `Received ${size3(from3(publicKey))} bytes.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "PublicKey.InvalidSerializedSizeError"
        });
      }
    };
    __name(InvalidSerializedSizeError, "InvalidSerializedSizeError");
  }
});

// node_modules/ox/_esm/core/Address.js
function assert4(value, options = {}) {
  const { strict = true } = options;
  if (!addressRegex2.test(value))
    throw new InvalidAddressError2({
      address: value,
      cause: new InvalidInputError()
    });
  if (strict) {
    if (value.toLowerCase() === value)
      return;
    if (checksum2(value) !== value)
      throw new InvalidAddressError2({
        address: value,
        cause: new InvalidChecksumError()
      });
  }
}
function checksum2(address) {
  if (checksum.has(address))
    return checksum.get(address);
  assert4(address, { strict: false });
  const hexAddress = address.substring(2).toLowerCase();
  const hash3 = keccak2562(fromString(hexAddress), { as: "Bytes" });
  const characters = hexAddress.split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash3[i >> 1] >> 4 >= 8 && characters[i]) {
      characters[i] = characters[i].toUpperCase();
    }
    if ((hash3[i >> 1] & 15) >= 8 && characters[i + 1]) {
      characters[i + 1] = characters[i + 1].toUpperCase();
    }
  }
  const result = `0x${characters.join("")}`;
  checksum.set(address, result);
  return result;
}
function from5(address, options = {}) {
  const { checksum: checksumVal = false } = options;
  assert4(address);
  if (checksumVal)
    return checksum2(address);
  return address;
}
function fromPublicKey(publicKey, options = {}) {
  const address = keccak2562(`0x${toHex2(publicKey).slice(4)}`).substring(26);
  return from5(`0x${address}`, options);
}
function validate3(address, options = {}) {
  const { strict = true } = options ?? {};
  try {
    assert4(address, { strict });
    return true;
  } catch {
    return false;
  }
}
var addressRegex2, InvalidAddressError2, InvalidInputError, InvalidChecksumError;
var init_Address = __esm({
  "node_modules/ox/_esm/core/Address.js"() {
    init_Bytes();
    init_Caches();
    init_Errors();
    init_Hash();
    init_PublicKey();
    addressRegex2 = /^0x[a-fA-F0-9]{40}$/;
    __name(assert4, "assert");
    __name(checksum2, "checksum");
    __name(from5, "from");
    __name(fromPublicKey, "fromPublicKey");
    __name(validate3, "validate");
    InvalidAddressError2 = class extends BaseError3 {
      constructor({ address, cause }) {
        super(`Address "${address}" is invalid.`, {
          cause
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Address.InvalidAddressError"
        });
      }
    };
    __name(InvalidAddressError2, "InvalidAddressError");
    InvalidInputError = class extends BaseError3 {
      constructor() {
        super("Address is not a 20 byte (40 hexadecimal character) value.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Address.InvalidInputError"
        });
      }
    };
    __name(InvalidInputError, "InvalidInputError");
    InvalidChecksumError = class extends BaseError3 {
      constructor() {
        super("Address does not match its checksum counterpart.");
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Address.InvalidChecksumError"
        });
      }
    };
    __name(InvalidChecksumError, "InvalidChecksumError");
  }
});

// node_modules/ox/_esm/core/Solidity.js
var arrayRegex, bytesRegex3, integerRegex3, maxInt82, maxInt162, maxInt242, maxInt322, maxInt402, maxInt482, maxInt562, maxInt642, maxInt722, maxInt802, maxInt882, maxInt962, maxInt1042, maxInt1122, maxInt1202, maxInt1282, maxInt1362, maxInt1442, maxInt1522, maxInt1602, maxInt1682, maxInt1762, maxInt1842, maxInt1922, maxInt2002, maxInt2082, maxInt2162, maxInt2242, maxInt2322, maxInt2402, maxInt2482, maxInt2562, minInt82, minInt162, minInt242, minInt322, minInt402, minInt482, minInt562, minInt642, minInt722, minInt802, minInt882, minInt962, minInt1042, minInt1122, minInt1202, minInt1282, minInt1362, minInt1442, minInt1522, minInt1602, minInt1682, minInt1762, minInt1842, minInt1922, minInt2002, minInt2082, minInt2162, minInt2242, minInt2322, minInt2402, minInt2482, minInt2562, maxUint82, maxUint162, maxUint242, maxUint322, maxUint402, maxUint482, maxUint562, maxUint642, maxUint722, maxUint802, maxUint882, maxUint962, maxUint1042, maxUint1122, maxUint1202, maxUint1282, maxUint1362, maxUint1442, maxUint1522, maxUint1602, maxUint1682, maxUint1762, maxUint1842, maxUint1922, maxUint2002, maxUint2082, maxUint2162, maxUint2242, maxUint2322, maxUint2402, maxUint2482, maxUint2562;
var init_Solidity = __esm({
  "node_modules/ox/_esm/core/Solidity.js"() {
    arrayRegex = /^(.*)\[([0-9]*)\]$/;
    bytesRegex3 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex3 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    maxInt82 = 2n ** (8n - 1n) - 1n;
    maxInt162 = 2n ** (16n - 1n) - 1n;
    maxInt242 = 2n ** (24n - 1n) - 1n;
    maxInt322 = 2n ** (32n - 1n) - 1n;
    maxInt402 = 2n ** (40n - 1n) - 1n;
    maxInt482 = 2n ** (48n - 1n) - 1n;
    maxInt562 = 2n ** (56n - 1n) - 1n;
    maxInt642 = 2n ** (64n - 1n) - 1n;
    maxInt722 = 2n ** (72n - 1n) - 1n;
    maxInt802 = 2n ** (80n - 1n) - 1n;
    maxInt882 = 2n ** (88n - 1n) - 1n;
    maxInt962 = 2n ** (96n - 1n) - 1n;
    maxInt1042 = 2n ** (104n - 1n) - 1n;
    maxInt1122 = 2n ** (112n - 1n) - 1n;
    maxInt1202 = 2n ** (120n - 1n) - 1n;
    maxInt1282 = 2n ** (128n - 1n) - 1n;
    maxInt1362 = 2n ** (136n - 1n) - 1n;
    maxInt1442 = 2n ** (144n - 1n) - 1n;
    maxInt1522 = 2n ** (152n - 1n) - 1n;
    maxInt1602 = 2n ** (160n - 1n) - 1n;
    maxInt1682 = 2n ** (168n - 1n) - 1n;
    maxInt1762 = 2n ** (176n - 1n) - 1n;
    maxInt1842 = 2n ** (184n - 1n) - 1n;
    maxInt1922 = 2n ** (192n - 1n) - 1n;
    maxInt2002 = 2n ** (200n - 1n) - 1n;
    maxInt2082 = 2n ** (208n - 1n) - 1n;
    maxInt2162 = 2n ** (216n - 1n) - 1n;
    maxInt2242 = 2n ** (224n - 1n) - 1n;
    maxInt2322 = 2n ** (232n - 1n) - 1n;
    maxInt2402 = 2n ** (240n - 1n) - 1n;
    maxInt2482 = 2n ** (248n - 1n) - 1n;
    maxInt2562 = 2n ** (256n - 1n) - 1n;
    minInt82 = -(2n ** (8n - 1n));
    minInt162 = -(2n ** (16n - 1n));
    minInt242 = -(2n ** (24n - 1n));
    minInt322 = -(2n ** (32n - 1n));
    minInt402 = -(2n ** (40n - 1n));
    minInt482 = -(2n ** (48n - 1n));
    minInt562 = -(2n ** (56n - 1n));
    minInt642 = -(2n ** (64n - 1n));
    minInt722 = -(2n ** (72n - 1n));
    minInt802 = -(2n ** (80n - 1n));
    minInt882 = -(2n ** (88n - 1n));
    minInt962 = -(2n ** (96n - 1n));
    minInt1042 = -(2n ** (104n - 1n));
    minInt1122 = -(2n ** (112n - 1n));
    minInt1202 = -(2n ** (120n - 1n));
    minInt1282 = -(2n ** (128n - 1n));
    minInt1362 = -(2n ** (136n - 1n));
    minInt1442 = -(2n ** (144n - 1n));
    minInt1522 = -(2n ** (152n - 1n));
    minInt1602 = -(2n ** (160n - 1n));
    minInt1682 = -(2n ** (168n - 1n));
    minInt1762 = -(2n ** (176n - 1n));
    minInt1842 = -(2n ** (184n - 1n));
    minInt1922 = -(2n ** (192n - 1n));
    minInt2002 = -(2n ** (200n - 1n));
    minInt2082 = -(2n ** (208n - 1n));
    minInt2162 = -(2n ** (216n - 1n));
    minInt2242 = -(2n ** (224n - 1n));
    minInt2322 = -(2n ** (232n - 1n));
    minInt2402 = -(2n ** (240n - 1n));
    minInt2482 = -(2n ** (248n - 1n));
    minInt2562 = -(2n ** (256n - 1n));
    maxUint82 = 2n ** 8n - 1n;
    maxUint162 = 2n ** 16n - 1n;
    maxUint242 = 2n ** 24n - 1n;
    maxUint322 = 2n ** 32n - 1n;
    maxUint402 = 2n ** 40n - 1n;
    maxUint482 = 2n ** 48n - 1n;
    maxUint562 = 2n ** 56n - 1n;
    maxUint642 = 2n ** 64n - 1n;
    maxUint722 = 2n ** 72n - 1n;
    maxUint802 = 2n ** 80n - 1n;
    maxUint882 = 2n ** 88n - 1n;
    maxUint962 = 2n ** 96n - 1n;
    maxUint1042 = 2n ** 104n - 1n;
    maxUint1122 = 2n ** 112n - 1n;
    maxUint1202 = 2n ** 120n - 1n;
    maxUint1282 = 2n ** 128n - 1n;
    maxUint1362 = 2n ** 136n - 1n;
    maxUint1442 = 2n ** 144n - 1n;
    maxUint1522 = 2n ** 152n - 1n;
    maxUint1602 = 2n ** 160n - 1n;
    maxUint1682 = 2n ** 168n - 1n;
    maxUint1762 = 2n ** 176n - 1n;
    maxUint1842 = 2n ** 184n - 1n;
    maxUint1922 = 2n ** 192n - 1n;
    maxUint2002 = 2n ** 200n - 1n;
    maxUint2082 = 2n ** 208n - 1n;
    maxUint2162 = 2n ** 216n - 1n;
    maxUint2242 = 2n ** 224n - 1n;
    maxUint2322 = 2n ** 232n - 1n;
    maxUint2402 = 2n ** 240n - 1n;
    maxUint2482 = 2n ** 248n - 1n;
    maxUint2562 = 2n ** 256n - 1n;
  }
});

// node_modules/ox/_esm/core/internal/abiParameters.js
function decodeParameter2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray2(cursor, { ...param, type }, { checksumAddress: checksumAddress2, length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
  if (param.type === "address")
    return decodeAddress3(cursor, { checksum: checksumAddress2 });
  if (param.type === "bool")
    return decodeBool2(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes2(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber2(cursor, param);
  if (param.type === "string")
    return decodeString2(cursor, { staticPosition });
  throw new InvalidTypeError(param.type);
}
function decodeAddress3(cursor, options = {}) {
  const { checksum: checksum3 = false } = options;
  const value = cursor.readBytes(32);
  const wrap3 = /* @__PURE__ */ __name((address) => checksum3 ? checksum2(address) : address, "wrap");
  return [wrap3(fromBytes(slice2(value, -20))), 32];
}
function decodeArray2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, length, staticPosition } = options;
  if (length === null) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength2;
    cursor.setPosition(start);
    const length2 = toNumber2(cursor.readBytes(sizeOfLength2));
    const dynamicChild = hasDynamicChild2(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0; i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
      if (consumed_ === 0) {
        cursor.assertReadLimit();
        cursor._touch();
      }
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0; i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0; i < length; ++i) {
    const [data, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
    if (consumed_ === 0) {
      cursor.assertReadLimit();
      cursor._touch();
    }
  }
  return [value, consumed];
}
function decodeBool2(cursor) {
  return [toBoolean(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes2(cursor, param, { staticPosition }) {
  const [_, size5] = param.type.split("bytes");
  if (!size5) {
    const offset = toNumber2(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = toNumber2(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [fromBytes(data), 32];
  }
  const value = fromBytes(cursor.readBytes(Number.parseInt(size5, 10), 32));
  return [value, 32];
}
function decodeNumber2(cursor, param) {
  const signed = param.type.startsWith("int");
  const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size5 > 48 ? toBigInt2(value, { signed }) : toNumber2(value, { signed }),
    32
  ];
}
function decodeTuple2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter2(cursor, component, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter2(cursor, component, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString2(cursor, { staticPosition }) {
  const offset = toNumber2(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = toNumber2(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = toString(trimLeft(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function prepareParameters({ checksumAddress: checksumAddress2, parameters, values }) {
  const preparedParameters = [];
  for (let i = 0; i < parameters.length; i++) {
    preparedParameters.push(prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: parameters[i],
      value: values[i]
    }));
  }
  return preparedParameters;
}
function prepareParameter({ checksumAddress: checksumAddress2 = false, parameter: parameter_, value }) {
  const parameter = parameter_;
  const arrayComponents = getArrayComponents2(parameter.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray2(value, {
      checksumAddress: checksumAddress2,
      length,
      parameter: {
        ...parameter,
        type
      }
    });
  }
  if (parameter.type === "tuple") {
    return encodeTuple2(value, {
      checksumAddress: checksumAddress2,
      parameter
    });
  }
  if (parameter.type === "address") {
    return encodeAddress2(value, {
      checksum: checksumAddress2
    });
  }
  if (parameter.type === "bool") {
    return encodeBoolean(value);
  }
  if (parameter.type.startsWith("uint") || parameter.type.startsWith("int")) {
    const signed = parameter.type.startsWith("int");
    const [, , size5 = "256"] = integerRegex3.exec(parameter.type) ?? [];
    return encodeNumber2(value, {
      signed,
      size: Number(size5)
    });
  }
  if (parameter.type.startsWith("bytes")) {
    return encodeBytes2(value, { type: parameter.type });
  }
  if (parameter.type === "string") {
    return encodeString2(value);
  }
  throw new InvalidTypeError(parameter.type);
}
function encode(preparedParameters) {
  let staticSize = 0;
  for (let i = 0; i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size3(encoded);
  }
  const staticParameters = [];
  const dynamicParameters = [];
  let dynamicSize = 0;
  for (let i = 0; i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic) {
      staticParameters.push(fromNumber(staticSize + dynamicSize, { size: 32 }));
      dynamicParameters.push(encoded);
      dynamicSize += size3(encoded);
    } else {
      staticParameters.push(encoded);
    }
  }
  return concat2(...staticParameters, ...dynamicParameters);
}
function encodeAddress2(value, options) {
  const { checksum: checksum3 = false } = options;
  assert4(value, { strict: checksum3 });
  return {
    dynamic: false,
    encoded: padLeft(value.toLowerCase())
  };
}
function encodeArray2(value, options) {
  const { checksumAddress: checksumAddress2, length, parameter } = options;
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError2(value);
  if (!dynamic && value.length !== length)
    throw new ArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${parameter.type}[${length}]`
    });
  let dynamicChild = value.length === 0 && hasDynamicChild2(parameter);
  const preparedParameters = [];
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter,
      value: value[i]
    });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParameters.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encode(preparedParameters);
    if (dynamic) {
      const length2 = fromNumber(preparedParameters.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParameters.length > 0 ? concat2(length2, data) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
function encodeBytes2(value, { type }) {
  const [, parametersize] = type.split("bytes");
  const bytesSize = size3(value);
  if (!parametersize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padRight(value_, Math.ceil((value.length - 2) / 2 / 32) * 32);
    return {
      dynamic: true,
      encoded: concat2(padLeft(fromNumber(bytesSize, { size: 32 })), value_)
    };
  }
  if (bytesSize !== Number.parseInt(parametersize, 10))
    throw new BytesSizeMismatchError2({
      expectedSize: Number.parseInt(parametersize, 10),
      value
    });
  return { dynamic: false, encoded: padRight(value) };
}
function encodeBoolean(value) {
  if (typeof value !== "boolean")
    throw new BaseError3(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padLeft(fromBoolean(value)) };
}
function encodeNumber2(value, { signed, size: size5 }) {
  if (typeof size5 === "number") {
    const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError2({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size5 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: fromNumber(value, {
      size: 32,
      signed
    })
  };
}
function encodeString2(value) {
  const hexValue = fromString2(value);
  const partsLength = Math.ceil(size3(hexValue) / 32);
  const parts = [];
  for (let i = 0; i < partsLength; i++) {
    parts.push(padRight(slice3(hexValue, i * 32, (i + 1) * 32)));
  }
  return {
    dynamic: true,
    encoded: concat2(padRight(fromNumber(size3(hexValue), { size: 32 })), ...parts)
  };
}
function encodeTuple2(value, options) {
  const { checksumAddress: checksumAddress2, parameter } = options;
  let dynamic = false;
  const preparedParameters = [];
  for (let i = 0; i < parameter.components.length; i++) {
    const param_ = parameter.components[i];
    const index2 = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: param_,
      value: value[index2]
    });
    preparedParameters.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encode(preparedParameters) : concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
function getArrayComponents2(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
function hasDynamicChild2(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild2);
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents && hasDynamicChild2({
    ...param,
    type: arrayComponents[1]
  }))
    return true;
  return false;
}
var sizeOfLength2, sizeOfOffset2;
var init_abiParameters = __esm({
  "node_modules/ox/_esm/core/internal/abiParameters.js"() {
    init_AbiParameters();
    init_Address();
    init_Bytes();
    init_Errors();
    init_Hex();
    init_Solidity();
    __name(decodeParameter2, "decodeParameter");
    sizeOfLength2 = 32;
    sizeOfOffset2 = 32;
    __name(decodeAddress3, "decodeAddress");
    __name(decodeArray2, "decodeArray");
    __name(decodeBool2, "decodeBool");
    __name(decodeBytes2, "decodeBytes");
    __name(decodeNumber2, "decodeNumber");
    __name(decodeTuple2, "decodeTuple");
    __name(decodeString2, "decodeString");
    __name(prepareParameters, "prepareParameters");
    __name(prepareParameter, "prepareParameter");
    __name(encode, "encode");
    __name(encodeAddress2, "encodeAddress");
    __name(encodeArray2, "encodeArray");
    __name(encodeBytes2, "encodeBytes");
    __name(encodeBoolean, "encodeBoolean");
    __name(encodeNumber2, "encodeNumber");
    __name(encodeString2, "encodeString");
    __name(encodeTuple2, "encodeTuple");
    __name(getArrayComponents2, "getArrayComponents");
    __name(hasDynamicChild2, "hasDynamicChild");
  }
});

// node_modules/ox/_esm/core/internal/cursor.js
function create(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor2);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor2, NegativeOffsetError2, PositionOutOfBoundsError2, RecursiveReadLimitExceededError2;
var init_cursor3 = __esm({
  "node_modules/ox/_esm/core/internal/cursor.js"() {
    init_Errors();
    staticCursor2 = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: /* @__PURE__ */ new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new RecursiveReadLimitExceededError2({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit
          });
      },
      assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
          throw new PositionOutOfBoundsError2({
            length: this.bytes.length,
            position
          });
      },
      decrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError2({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
      },
      getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
      },
      incrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError2({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
      },
      inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
      },
      inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
      },
      inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
      },
      inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
      },
      pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
      },
      pushBytes(bytes) {
        this.assertPosition(this.position + bytes.length - 1);
        this.bytes.set(bytes, this.position);
        this.position += bytes.length;
      },
      pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
      },
      pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
      },
      pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
      },
      pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
      },
      readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
      },
      readBytes(length, size5) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size5 ?? length;
        return value;
      },
      readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
      },
      readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
      },
      readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
      },
      readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => this.position = oldPosition;
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
          return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
          this.recursiveReadCount++;
      }
    };
    __name(create, "create");
    NegativeOffsetError2 = class extends BaseError3 {
      constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Cursor.NegativeOffsetError"
        });
      }
    };
    __name(NegativeOffsetError2, "NegativeOffsetError");
    PositionOutOfBoundsError2 = class extends BaseError3 {
      constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Cursor.PositionOutOfBoundsError"
        });
      }
    };
    __name(PositionOutOfBoundsError2, "PositionOutOfBoundsError");
    RecursiveReadLimitExceededError2 = class extends BaseError3 {
      constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Cursor.RecursiveReadLimitExceededError"
        });
      }
    };
    __name(RecursiveReadLimitExceededError2, "RecursiveReadLimitExceededError");
  }
});

// node_modules/ox/_esm/core/AbiParameters.js
function decode(parameters, data, options = {}) {
  const { as = "Array", checksumAddress: checksumAddress2 = false } = options;
  const bytes = typeof data === "string" ? fromHex(data) : data;
  const cursor = create(bytes);
  if (size2(bytes) === 0 && parameters.length > 0)
    throw new ZeroDataError();
  if (size2(bytes) && size2(bytes) < 32)
    throw new DataSizeTooSmallError({
      data: typeof data === "string" ? data : fromBytes(data),
      parameters,
      size: size2(bytes)
    });
  let consumed = 0;
  const values = as === "Array" ? [] : {};
  for (let i = 0; i < parameters.length; ++i) {
    const param = parameters[i];
    if (consumed < bytes.length)
      cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: 0
    });
    consumed += consumed_;
    if (as === "Array")
      values.push(data2);
    else
      values[param.name ?? i] = data2;
  }
  return values;
}
function encode2(parameters, values, options) {
  const { checksumAddress: checksumAddress2 = false } = options ?? {};
  if (parameters.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: parameters.length,
      givenLength: values.length
    });
  const preparedParameters = prepareParameters({
    checksumAddress: checksumAddress2,
    parameters,
    values
  });
  const data = encode(preparedParameters);
  if (data.length === 0)
    return "0x";
  return data;
}
function encodePacked(types, values) {
  if (types.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: types.length,
      givenLength: values.length
    });
  const data = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const value = values[i];
    data.push(encodePacked.encode(type, value));
  }
  return concat2(...data);
}
function from6(parameters) {
  if (Array.isArray(parameters) && typeof parameters[0] === "string")
    return parseAbiParameters(parameters);
  if (typeof parameters === "string")
    return parseAbiParameters(parameters);
  return parameters;
}
var DataSizeTooSmallError, ZeroDataError, ArrayLengthMismatchError, BytesSizeMismatchError2, LengthMismatchError, InvalidArrayError2, InvalidTypeError;
var init_AbiParameters = __esm({
  "node_modules/ox/_esm/core/AbiParameters.js"() {
    init_exports();
    init_Address();
    init_Bytes();
    init_Errors();
    init_Hex();
    init_abiParameters();
    init_cursor3();
    init_Solidity();
    __name(decode, "decode");
    __name(encode2, "encode");
    __name(encodePacked, "encodePacked");
    (function(encodePacked2) {
      function encode4(type, value, isArray = false) {
        if (type === "address") {
          const address = value;
          assert4(address);
          return padLeft(address.toLowerCase(), isArray ? 32 : 0);
        }
        if (type === "string")
          return fromString2(value);
        if (type === "bytes")
          return value;
        if (type === "bool")
          return padLeft(fromBoolean(value), isArray ? 32 : 1);
        const intMatch = type.match(integerRegex3);
        if (intMatch) {
          const [_type, baseType, bits = "256"] = intMatch;
          const size5 = Number.parseInt(bits, 10) / 8;
          return fromNumber(value, {
            size: isArray ? 32 : size5,
            signed: baseType === "int"
          });
        }
        const bytesMatch = type.match(bytesRegex3);
        if (bytesMatch) {
          const [_type, size5] = bytesMatch;
          if (Number.parseInt(size5, 10) !== (value.length - 2) / 2)
            throw new BytesSizeMismatchError2({
              expectedSize: Number.parseInt(size5, 10),
              value
            });
          return padRight(value, isArray ? 32 : 0);
        }
        const arrayMatch = type.match(arrayRegex);
        if (arrayMatch && Array.isArray(value)) {
          const [_type, childType] = arrayMatch;
          const data = [];
          for (let i = 0; i < value.length; i++) {
            data.push(encode4(childType, value[i], true));
          }
          if (data.length === 0)
            return "0x";
          return concat2(...data);
        }
        throw new InvalidTypeError(type);
      }
      __name(encode4, "encode");
      encodePacked2.encode = encode4;
    })(encodePacked || (encodePacked = {}));
    __name(from6, "from");
    DataSizeTooSmallError = class extends BaseError3 {
      constructor({ data, parameters, size: size5 }) {
        super(`Data size of ${size5} bytes is too small for given parameters.`, {
          metaMessages: [
            `Params: (${formatAbiParameters(parameters)})`,
            `Data:   ${data} (${size5} bytes)`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.DataSizeTooSmallError"
        });
      }
    };
    __name(DataSizeTooSmallError, "DataSizeTooSmallError");
    ZeroDataError = class extends BaseError3 {
      constructor() {
        super('Cannot decode zero data ("0x") with ABI parameters.');
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.ZeroDataError"
        });
      }
    };
    __name(ZeroDataError, "ZeroDataError");
    ArrayLengthMismatchError = class extends BaseError3 {
      constructor({ expectedLength, givenLength, type }) {
        super(`Array length mismatch for type \`${type}\`. Expected: \`${expectedLength}\`. Given: \`${givenLength}\`.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.ArrayLengthMismatchError"
        });
      }
    };
    __name(ArrayLengthMismatchError, "ArrayLengthMismatchError");
    BytesSizeMismatchError2 = class extends BaseError3 {
      constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${size3(value)}) does not match expected size (bytes${expectedSize}).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.BytesSizeMismatchError"
        });
      }
    };
    __name(BytesSizeMismatchError2, "BytesSizeMismatchError");
    LengthMismatchError = class extends BaseError3 {
      constructor({ expectedLength, givenLength }) {
        super([
          "ABI encoding parameters/values length mismatch.",
          `Expected length (parameters): ${expectedLength}`,
          `Given length (values): ${givenLength}`
        ].join("\n"));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.LengthMismatchError"
        });
      }
    };
    __name(LengthMismatchError, "LengthMismatchError");
    InvalidArrayError2 = class extends BaseError3 {
      constructor(value) {
        super(`Value \`${value}\` is not a valid array.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.InvalidArrayError"
        });
      }
    };
    __name(InvalidArrayError2, "InvalidArrayError");
    InvalidTypeError = class extends BaseError3 {
      constructor(type) {
        super(`Type \`${type}\` is not a valid ABI Type.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiParameters.InvalidTypeError"
        });
      }
    };
    __name(InvalidTypeError, "InvalidTypeError");
  }
});

// node_modules/ox/_esm/core/Rlp.js
function from7(value, options) {
  const { as } = options;
  const encodable = getEncodable2(value);
  const cursor = create(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (as === "Hex")
    return fromBytes(cursor.bytes);
  return cursor.bytes;
}
function fromHex3(hex, options = {}) {
  const { as = "Hex" } = options;
  return from7(hex, { as });
}
function getEncodable2(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList2(bytes.map((x) => getEncodable2(x)));
  return getEncodableBytes2(bytes);
}
function getEncodableList2(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength2(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode4 } of list) {
        encode4(cursor);
      }
    }
  };
}
function getEncodableBytes2(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? fromHex(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength2(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength2(length) {
  if (length <= 255)
    return 1;
  if (length <= 65535)
    return 2;
  if (length <= 16777215)
    return 3;
  if (length <= 4294967295)
    return 4;
  throw new BaseError3("Length is too large.");
}
var init_Rlp = __esm({
  "node_modules/ox/_esm/core/Rlp.js"() {
    init_Bytes();
    init_Errors();
    init_Hex();
    init_cursor3();
    __name(from7, "from");
    __name(fromHex3, "fromHex");
    __name(getEncodable2, "getEncodable");
    __name(getEncodableList2, "getEncodableList");
    __name(getEncodableBytes2, "getEncodableBytes");
    __name(getSizeOfLength2, "getSizeOfLength");
  }
});

// node_modules/ox/_esm/core/Signature.js
function assert5(signature, options = {}) {
  const { recovered } = options;
  if (typeof signature.r === "undefined")
    throw new MissingPropertiesError({ signature });
  if (typeof signature.s === "undefined")
    throw new MissingPropertiesError({ signature });
  if (recovered && typeof signature.yParity === "undefined")
    throw new MissingPropertiesError({ signature });
  if (signature.r < 0n || signature.r > maxUint2562)
    throw new InvalidRError({ value: signature.r });
  if (signature.s < 0n || signature.s > maxUint2562)
    throw new InvalidSError({ value: signature.s });
  if (typeof signature.yParity === "number" && signature.yParity !== 0 && signature.yParity !== 1)
    throw new InvalidYParityError({ value: signature.yParity });
}
function fromBytes3(signature) {
  return fromHex4(fromBytes(signature));
}
function fromHex4(signature) {
  if (signature.length !== 130 && signature.length !== 132)
    throw new InvalidSerializedSizeError2({ signature });
  const r = BigInt(slice3(signature, 0, 32));
  const s = BigInt(slice3(signature, 32, 64));
  const yParity = (() => {
    const yParity2 = Number(`0x${signature.slice(130)}`);
    if (Number.isNaN(yParity2))
      return void 0;
    try {
      return vToYParity(yParity2);
    } catch {
      throw new InvalidYParityError({ value: yParity2 });
    }
  })();
  if (typeof yParity === "undefined")
    return {
      r,
      s
    };
  return {
    r,
    s,
    yParity
  };
}
function extract2(value) {
  if (typeof value.r === "undefined")
    return void 0;
  if (typeof value.s === "undefined")
    return void 0;
  return from8(value);
}
function from8(signature) {
  const signature_ = (() => {
    if (typeof signature === "string")
      return fromHex4(signature);
    if (signature instanceof Uint8Array)
      return fromBytes3(signature);
    if (typeof signature.r === "string")
      return fromRpc2(signature);
    if (signature.v)
      return fromLegacy(signature);
    return {
      r: signature.r,
      s: signature.s,
      ...typeof signature.yParity !== "undefined" ? { yParity: signature.yParity } : {}
    };
  })();
  assert5(signature_);
  return signature_;
}
function fromLegacy(signature) {
  return {
    r: signature.r,
    s: signature.s,
    yParity: vToYParity(signature.v)
  };
}
function fromRpc2(signature) {
  const yParity = (() => {
    const v = signature.v ? Number(signature.v) : void 0;
    let yParity2 = signature.yParity ? Number(signature.yParity) : void 0;
    if (typeof v === "number" && typeof yParity2 !== "number")
      yParity2 = vToYParity(v);
    if (typeof yParity2 !== "number")
      throw new InvalidYParityError({ value: signature.yParity });
    return yParity2;
  })();
  return {
    r: BigInt(signature.r),
    s: BigInt(signature.s),
    yParity
  };
}
function toTuple(signature) {
  const { r, s, yParity } = signature;
  return [
    yParity ? "0x01" : "0x",
    r === 0n ? "0x" : trimLeft2(fromNumber(r)),
    s === 0n ? "0x" : trimLeft2(fromNumber(s))
  ];
}
function vToYParity(v) {
  if (v === 0 || v === 27)
    return 0;
  if (v === 1 || v === 28)
    return 1;
  if (v >= 35)
    return v % 2 === 0 ? 1 : 0;
  throw new InvalidVError({ value: v });
}
var InvalidSerializedSizeError2, MissingPropertiesError, InvalidRError, InvalidSError, InvalidYParityError, InvalidVError;
var init_Signature = __esm({
  "node_modules/ox/_esm/core/Signature.js"() {
    init_Errors();
    init_Hex();
    init_Json();
    init_Solidity();
    __name(assert5, "assert");
    __name(fromBytes3, "fromBytes");
    __name(fromHex4, "fromHex");
    __name(extract2, "extract");
    __name(from8, "from");
    __name(fromLegacy, "fromLegacy");
    __name(fromRpc2, "fromRpc");
    __name(toTuple, "toTuple");
    __name(vToYParity, "vToYParity");
    InvalidSerializedSizeError2 = class extends BaseError3 {
      constructor({ signature }) {
        super(`Value \`${signature}\` is an invalid signature size.`, {
          metaMessages: [
            "Expected: 64 bytes or 65 bytes.",
            `Received ${size3(from3(signature))} bytes.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.InvalidSerializedSizeError"
        });
      }
    };
    __name(InvalidSerializedSizeError2, "InvalidSerializedSizeError");
    MissingPropertiesError = class extends BaseError3 {
      constructor({ signature }) {
        super(`Signature \`${stringify2(signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.MissingPropertiesError"
        });
      }
    };
    __name(MissingPropertiesError, "MissingPropertiesError");
    InvalidRError = class extends BaseError3 {
      constructor({ value }) {
        super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.InvalidRError"
        });
      }
    };
    __name(InvalidRError, "InvalidRError");
    InvalidSError = class extends BaseError3 {
      constructor({ value }) {
        super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.InvalidSError"
        });
      }
    };
    __name(InvalidSError, "InvalidSError");
    InvalidYParityError = class extends BaseError3 {
      constructor({ value }) {
        super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.InvalidYParityError"
        });
      }
    };
    __name(InvalidYParityError, "InvalidYParityError");
    InvalidVError = class extends BaseError3 {
      constructor({ value }) {
        super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Signature.InvalidVError"
        });
      }
    };
    __name(InvalidVError, "InvalidVError");
  }
});

// node_modules/ox/_esm/core/Authorization.js
function from9(authorization, options = {}) {
  if (typeof authorization.chainId === "string")
    return fromRpc3(authorization);
  return { ...authorization, ...options.signature };
}
function fromRpc3(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return {
    address,
    chainId: Number(chainId),
    nonce: BigInt(nonce),
    ...signature
  };
}
function getSignPayload(authorization) {
  return hash2(authorization, { presign: true });
}
function hash2(authorization, options = {}) {
  const { presign } = options;
  return keccak2562(concat2("0x05", fromHex3(toTuple2(presign ? {
    address: authorization.address,
    chainId: authorization.chainId,
    nonce: authorization.nonce
  } : authorization))));
}
function toTuple2(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return [
    chainId ? fromNumber(chainId) : "0x",
    address,
    nonce ? fromNumber(nonce) : "0x",
    ...signature ? toTuple(signature) : []
  ];
}
var init_Authorization = __esm({
  "node_modules/ox/_esm/core/Authorization.js"() {
    init_Hash();
    init_Hex();
    init_Rlp();
    init_Signature();
    __name(from9, "from");
    __name(fromRpc3, "fromRpc");
    __name(getSignPayload, "getSignPayload");
    __name(hash2, "hash");
    __name(toTuple2, "toTuple");
  }
});

// node_modules/ox/_esm/core/Secp256k1.js
function recoverAddress2(options) {
  return fromPublicKey(recoverPublicKey2(options));
}
function recoverPublicKey2(options) {
  const { payload, signature } = options;
  const { r, s, yParity } = signature;
  const signature_ = new secp256k1.Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
  const point = signature_.recoverPublicKey(from3(payload).substring(2));
  return from4(point);
}
var fromSeedDomain;
var init_Secp256k1 = __esm({
  "node_modules/ox/_esm/core/Secp256k1.js"() {
    init_secp256k1();
    init_Address();
    init_Bytes();
    init_Hex();
    init_PublicKey();
    __name(recoverAddress2, "recoverAddress");
    __name(recoverPublicKey2, "recoverPublicKey");
    fromSeedDomain = fromString("ox.secp256k1.fromSeed.v1");
  }
});

// node_modules/ox/_esm/erc8010/SignatureErc8010.js
var SignatureErc8010_exports = {};
__export(SignatureErc8010_exports, {
  InvalidWrappedSignatureError: () => InvalidWrappedSignatureError,
  assert: () => assert6,
  from: () => from10,
  magicBytes: () => magicBytes,
  suffixParameters: () => suffixParameters,
  unwrap: () => unwrap,
  validate: () => validate4,
  wrap: () => wrap
});
function assert6(value) {
  if (typeof value === "string") {
    if (slice3(value, -32) !== magicBytes)
      throw new InvalidWrappedSignatureError(value);
  } else
    assert5(value.authorization);
}
function from10(value) {
  if (typeof value === "string")
    return unwrap(value);
  return value;
}
function unwrap(wrapped) {
  assert6(wrapped);
  const suffixLength = toNumber(slice3(wrapped, -64, -32));
  const suffix = slice3(wrapped, -suffixLength - 64, -64);
  const signature = slice3(wrapped, 0, -suffixLength - 64);
  const [auth, to, data] = decode(suffixParameters, suffix);
  const authorization = from9({
    address: auth.delegation,
    chainId: Number(auth.chainId),
    nonce: auth.nonce,
    yParity: auth.yParity,
    r: auth.r,
    s: auth.s
  });
  return {
    authorization,
    signature,
    ...data && data !== "0x" ? { data, to } : {}
  };
}
function wrap(value) {
  const { data, signature } = value;
  assert6(value);
  const self = recoverAddress2({
    payload: getSignPayload(value.authorization),
    signature: from8(value.authorization)
  });
  const suffix = encode2(suffixParameters, [
    {
      ...value.authorization,
      delegation: value.authorization.address,
      chainId: BigInt(value.authorization.chainId)
    },
    value.to ?? self,
    data ?? "0x"
  ]);
  const suffixLength = fromNumber(size3(suffix), { size: 32 });
  return concat2(signature, suffix, suffixLength, magicBytes);
}
function validate4(value) {
  try {
    assert6(value);
    return true;
  } catch {
    return false;
  }
}
var magicBytes, suffixParameters, InvalidWrappedSignatureError;
var init_SignatureErc8010 = __esm({
  "node_modules/ox/_esm/erc8010/SignatureErc8010.js"() {
    init_AbiParameters();
    init_Authorization();
    init_Errors();
    init_Hex();
    init_Secp256k1();
    init_Signature();
    magicBytes = "0x8010801080108010801080108010801080108010801080108010801080108010";
    suffixParameters = from6("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
    __name(assert6, "assert");
    __name(from10, "from");
    __name(unwrap, "unwrap");
    __name(wrap, "wrap");
    __name(validate4, "validate");
    InvalidWrappedSignatureError = class extends BaseError3 {
      constructor(wrapped) {
        super(`Value \`${wrapped}\` is an invalid ERC-8010 wrapped signature.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SignatureErc8010.InvalidWrappedSignatureError"
        });
      }
    };
    __name(InvalidWrappedSignatureError, "InvalidWrappedSignatureError");
  }
});

// node_modules/ox/_esm/erc8010/index.js
var init_erc8010 = __esm({
  "node_modules/ox/_esm/erc8010/index.js"() {
    init_SignatureErc8010();
  }
});

// node_modules/viem/_esm/utils/unit/formatUnits.js
function formatUnits(value, decimals) {
  return format(value, decimals);
}
var init_formatUnits = __esm({
  "node_modules/viem/_esm/utils/unit/formatUnits.js"() {
    init_Value();
    __name(formatUnits, "formatUnits");
  }
});

// node_modules/viem/_esm/utils/unit/parseUnits.js
function parseUnits(value, decimals) {
  return from(value, decimals);
}
var init_parseUnits = __esm({
  "node_modules/viem/_esm/utils/unit/parseUnits.js"() {
    init_Value();
    __name(parseUnits, "parseUnits");
  }
});

// node_modules/viem/_esm/utils/index.js
var init_utils5 = __esm({
  "node_modules/viem/_esm/utils/index.js"() {
    init_encodeFunctionData();
    init_fromHex();
  }
});

// node_modules/viem/_esm/actions/public/getTransaction.js
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash3, index: index2, sender, nonce }) {
  const blockTag = blockTag_ || "latest";
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let transaction = null;
  if (hash3) {
    transaction = await client.request({
      method: "eth_getTransactionByHash",
      params: [hash3]
    }, { dedupe: true });
  } else if (blockHash) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockHashAndIndex",
      params: [blockHash, numberToHex(index2)]
    }, { dedupe: true });
  } else if ((blockNumberHex || blockTag) && typeof index2 === "number") {
    transaction = await client.request({
      method: "eth_getTransactionByBlockNumberAndIndex",
      params: [blockNumberHex || blockTag, numberToHex(index2)]
    }, { dedupe: Boolean(blockNumberHex) });
  } else if (sender && typeof nonce === "number") {
    transaction = await client.request({
      method: "eth_getTransactionBySenderAndNonce",
      params: [sender, numberToHex(nonce)]
    }, { dedupe: true });
  }
  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash: hash3,
      index: index2
    });
  const format2 = client.chain?.formatters?.transaction?.format || formatTransaction;
  return format2(transaction, "getTransaction");
}
var init_getTransaction = __esm({
  "node_modules/viem/_esm/actions/public/getTransaction.js"() {
    init_transaction();
    init_toHex();
    init_transaction2();
    __name(getTransaction, "getTransaction");
  }
});

// node_modules/viem/_esm/actions/public/getTransactionReceipt.js
async function getTransactionReceipt(client, { hash: hash3 }) {
  const receipt = await client.request({
    method: "eth_getTransactionReceipt",
    params: [hash3]
  }, { dedupe: true });
  if (!receipt)
    throw new TransactionReceiptNotFoundError({ hash: hash3 });
  const format2 = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return format2(receipt, "getTransactionReceipt");
}
var init_getTransactionReceipt = __esm({
  "node_modules/viem/_esm/actions/public/getTransactionReceipt.js"() {
    init_transaction();
    init_transactionReceipt();
    __name(getTransactionReceipt, "getTransactionReceipt");
  }
});

// node_modules/viem/_esm/actions/public/multicall.js
async function multicall(client, parameters) {
  const { account, authorizationList, allowFailure = true, blockHash, blockNumber, blockOverrides, blockTag, requireCanonical, stateOverride } = parameters;
  const contracts2 = parameters.contracts;
  const batch = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const batchSize = parameters.batchSize ?? batch.batchSize ?? 1024;
  const deployless = parameters.deployless ?? batch.deployless ?? false;
  const multicallAddress = (() => {
    if (parameters.multicallAddress)
      return parameters.multicallAddress;
    if (deployless)
      return null;
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: "multicall3"
      });
    }
    throw new Error("client chain not configured. multicallAddress is required.");
  })();
  const chunkedCalls = [[]];
  let currentChunk = 0;
  let currentChunkSize = 0;
  for (let i = 0; i < contracts2.length; i++) {
    const { abi: abi2, address, args, functionName } = contracts2[i];
    try {
      const callData = encodeFunctionData({ abi: abi2, args, functionName });
      currentChunkSize += (callData.length - 2) / 2;
      if (
        // Check if batching is enabled.
        batchSize > 0 && // Check if the current size of the batch exceeds the size limit.
        currentChunkSize > batchSize && // Check if the current chunk is not already empty.
        chunkedCalls[currentChunk].length > 0
      ) {
        currentChunk++;
        currentChunkSize = (callData.length - 2) / 2;
        chunkedCalls[currentChunk] = [];
      }
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address
        }
      ];
    } catch (err) {
      const error = getContractError(err, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName,
        sender: account
      });
      if (!allowFailure)
        throw error;
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: "0x",
          target: address
        }
      ];
    }
  }
  const batching = Boolean(client.batch?.multicall);
  const batches = batching ? chunkedCalls.flatMap((calls) => calls.map((call2) => [call2])) : chunkedCalls;
  const aggregate3Results = await Promise.allSettled(batches.map((calls) => {
    if (batching)
      return scheduleMulticall2(client, {
        account,
        authorizationList,
        batchSize,
        blockHash,
        blockNumber,
        blockOverrides,
        blockTag,
        call: calls[0],
        multicallAddress,
        requireCanonical,
        stateOverride
      }).then((result) => [result]);
    return getAction(client, readContract, "readContract")({
      ...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
      abi: multicall3Abi,
      account,
      args: [calls],
      authorizationList,
      blockHash,
      blockNumber,
      blockOverrides,
      blockTag,
      functionName: "aggregate3",
      requireCanonical,
      stateOverride
    });
  }));
  const results = [];
  for (let i = 0; i < aggregate3Results.length; i++) {
    const result = aggregate3Results[i];
    if (result.status === "rejected") {
      if (!allowFailure)
        throw result.reason;
      for (let j = 0; j < batches[i].length; j++) {
        results.push({
          status: "failure",
          error: result.reason,
          result: void 0
        });
      }
      continue;
    }
    const aggregate3Result = result.value;
    for (let j = 0; j < aggregate3Result.length; j++) {
      const { returnData, success } = aggregate3Result[j];
      const { callData } = batches[i][j];
      const { abi: abi2, address, functionName, args } = contracts2[results.length];
      try {
        if (callData === "0x")
          throw new AbiDecodingZeroDataError();
        if (!success)
          throw new RawContractError({ data: returnData });
        const result2 = decodeFunctionResult({
          abi: abi2,
          args,
          data: returnData,
          functionName
        });
        results.push(allowFailure ? { result: result2, status: "success" } : result2);
      } catch (err) {
        const error = getContractError(err, {
          abi: abi2,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName
        });
        if (!allowFailure)
          throw error;
        results.push({ error, result: void 0, status: "failure" });
      }
    }
  }
  if (results.length !== contracts2.length)
    throw new BaseError2("multicall results mismatch");
  return results;
}
async function scheduleMulticall2(client, parameters) {
  const { batchSize, call: call2, multicallAddress, ...rest } = parameters;
  const { wait: wait2 = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { schedule } = createBatchScheduler({
    id: stringify(["multicall", client.uid, batchSize, multicallAddress, rest]),
    wait: wait2,
    shouldSplitBatch(calls) {
      if (batchSize === 0)
        return false;
      const size5 = calls.reduce((size6, { callData }) => size6 + (callData.length - 2) / 2, 0);
      return size5 > batchSize;
    },
    fn: (calls) => getAction(client, readContract, "readContract")({
      ...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
      ...rest,
      abi: multicall3Abi,
      args: [calls],
      functionName: "aggregate3"
    })
  });
  const [result] = await schedule(call2);
  return result;
}
var init_multicall = __esm({
  "node_modules/viem/_esm/actions/public/multicall.js"() {
    init_abis();
    init_contracts();
    init_abi();
    init_base();
    init_contract();
    init_decodeFunctionResult();
    init_encodeFunctionData();
    init_getChainContractAddress();
    init_getContractError();
    init_getAction();
    init_createBatchScheduler();
    init_stringify();
    init_readContract();
    __name(multicall, "multicall");
    __name(scheduleMulticall2, "scheduleMulticall");
  }
});

// node_modules/ox/_esm/core/internal/abiItem.js
function normalizeSignature2(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", "error", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError3("Unable to normalize signature.");
  return result;
}
function isArgOfType2(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return validate3(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return isArgOfType2(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType2(x, {
          ...abiParameter,
          // Pop off `[]` or `[M]` from end of type
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes2(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes2(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      if (types.includes("address") && types.includes("bytes"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_abiItem2 = __esm({
  "node_modules/ox/_esm/core/internal/abiItem.js"() {
    init_Address();
    init_Errors();
    __name(normalizeSignature2, "normalizeSignature");
    __name(isArgOfType2, "isArgOfType");
    __name(getAmbiguousTypes2, "getAmbiguousTypes");
  }
});

// node_modules/ox/_esm/core/AbiItem.js
function from11(abiItem, options = {}) {
  const { prepare = true } = options;
  const item = (() => {
    if (Array.isArray(abiItem))
      return parseAbiItem(abiItem);
    if (typeof abiItem === "string")
      return parseAbiItem(abiItem);
    return abiItem;
  })();
  return {
    ...item,
    ...prepare ? { hash: getSignatureHash(item) } : {}
  };
}
function fromAbi(abi2, name, options) {
  const { args = [], prepare = true } = options ?? {};
  const isSelector = validate2(name, { strict: false });
  const abiItems = abi2.filter((abiItem2) => {
    if (isSelector) {
      if (abiItem2.type === "function" || abiItem2.type === "error")
        return getSelector(abiItem2) === slice3(name, 0, 4);
      if (abiItem2.type === "event")
        return getSignatureHash(abiItem2) === name;
      return false;
    }
    return "name" in abiItem2 && abiItem2.name === name;
  });
  if (abiItems.length === 0)
    throw new NotFoundError({ name });
  if (abiItems.length === 1)
    return {
      ...abiItems[0],
      ...prepare ? { hash: getSignatureHash(abiItems[0]) } : {}
    };
  let matchedAbiItem;
  for (const abiItem2 of abiItems) {
    if (!("inputs" in abiItem2))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem2.inputs || abiItem2.inputs.length === 0)
        return {
          ...abiItem2,
          ...prepare ? { hash: getSignatureHash(abiItem2) } : {}
        };
      continue;
    }
    if (!abiItem2.inputs)
      continue;
    if (abiItem2.inputs.length === 0)
      continue;
    if (abiItem2.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem2 && abiItem2.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType2(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes2(abiItem2.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AmbiguityError({
            abiItem: abiItem2,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem2;
    }
  }
  const abiItem = (() => {
    if (matchedAbiItem)
      return matchedAbiItem;
    const [abiItem2, ...overloads] = abiItems;
    return { ...abiItem2, overloads };
  })();
  if (!abiItem)
    throw new NotFoundError({ name });
  return {
    ...abiItem,
    ...prepare ? { hash: getSignatureHash(abiItem) } : {}
  };
}
function getSelector(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  return slice3(getSignatureHash(abiItem), 0, 4);
}
function getSignature(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  const signature = (() => {
    if (typeof abiItem === "string")
      return abiItem;
    return formatAbiItem(abiItem);
  })();
  return normalizeSignature2(signature);
}
function getSignatureHash(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  if (typeof abiItem !== "string" && "hash" in abiItem && abiItem.hash)
    return abiItem.hash;
  return keccak2562(fromString2(getSignature(abiItem)));
}
var AmbiguityError, NotFoundError;
var init_AbiItem = __esm({
  "node_modules/ox/_esm/core/AbiItem.js"() {
    init_exports();
    init_Errors();
    init_Hash();
    init_Hex();
    init_abiItem2();
    __name(from11, "from");
    __name(fromAbi, "fromAbi");
    __name(getSelector, "getSelector");
    __name(getSignature, "getSignature");
    __name(getSignatureHash, "getSignatureHash");
    AmbiguityError = class extends BaseError3 {
      constructor(x, y) {
        super("Found ambiguous types in overloaded ABI Items.", {
          metaMessages: [
            // TODO: abitype to add support for signature-formatted ABI items.
            `\`${x.type}\` in \`${normalizeSignature2(formatAbiItem(x.abiItem))}\`, and`,
            `\`${y.type}\` in \`${normalizeSignature2(formatAbiItem(y.abiItem))}\``,
            "",
            "These types encode differently and cannot be distinguished at runtime.",
            "Remove one of the ambiguous items in the ABI."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiItem.AmbiguityError"
        });
      }
    };
    __name(AmbiguityError, "AmbiguityError");
    NotFoundError = class extends BaseError3 {
      constructor({ name, data, type = "item" }) {
        const selector = (() => {
          if (name)
            return ` with name "${name}"`;
          if (data)
            return ` with data "${data}"`;
          return "";
        })();
        super(`ABI ${type}${selector} not found.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiItem.NotFoundError"
        });
      }
    };
    __name(NotFoundError, "NotFoundError");
  }
});

// node_modules/ox/_esm/core/AbiEvent.js
function from13(abiEvent, options = {}) {
  return from11(abiEvent, options);
}
function getSelector2(abiItem) {
  return getSignatureHash(abiItem);
}
var init_AbiEvent = __esm({
  "node_modules/ox/_esm/core/AbiEvent.js"() {
    init_AbiItem();
    __name(from13, "from");
    __name(getSelector2, "getSelector");
  }
});

// node_modules/viem/_esm/constants/address.js
var ethAddress, zeroAddress;
var init_address2 = __esm({
  "node_modules/viem/_esm/constants/address.js"() {
    ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    zeroAddress = "0x0000000000000000000000000000000000000000";
  }
});

// node_modules/viem/_esm/actions/public/watchBlockNumber.js
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  let prevBlockNumber;
  const pollBlockNumber = /* @__PURE__ */ __name(() => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
      try {
        const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
        if (prevBlockNumber !== void 0) {
          if (blockNumber === prevBlockNumber)
            return;
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
              emit.onBlockNumber(i, prevBlockNumber);
              prevBlockNumber = i;
            }
          }
        }
        if (prevBlockNumber === void 0 || blockNumber > prevBlockNumber) {
          emit.onBlockNumber(blockNumber, prevBlockNumber);
          prevBlockNumber = blockNumber;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  }, "pollBlockNumber");
  const subscribeBlockNumber = /* @__PURE__ */ __name(() => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => {
      let active = true;
      let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            onData(data) {
              if (!active)
                return;
              const blockNumber = hexToBigInt(data.result?.number);
              emit.onBlockNumber(blockNumber, prevBlockNumber);
              prevBlockNumber = blockNumber;
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  }, "subscribeBlockNumber");
  return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}
var init_watchBlockNumber = __esm({
  "node_modules/viem/_esm/actions/public/watchBlockNumber.js"() {
    init_fromHex();
    init_getAction();
    init_observe();
    init_poll();
    init_stringify();
    init_getBlockNumber();
    __name(watchBlockNumber, "watchBlockNumber");
  }
});

// node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
async function waitForTransactionReceipt(client, parameters) {
  const {
    checkReplacement = client.chain?.supportsTransactionReplacementDetection ?? true,
    confirmations = 1,
    hash: hash3,
    onReplaced,
    retryCount = 6,
    retryDelay = /* @__PURE__ */ __name(({ count }) => ~~(1 << count) * 200, "retryDelay"),
    // exponential backoff
    timeout = 18e4
  } = parameters;
  const getReplacementKey = /* @__PURE__ */ __name((transaction2) => client.chain?.transactionReplacement?.getKey?.(transaction2) ?? String(transaction2.nonce), "getReplacementKey");
  const pollingInterval = (() => {
    if (parameters.pollingInterval)
      return parameters.pollingInterval;
    if (client.chain?.experimental_preconfirmationTime)
      return client.chain.experimental_preconfirmationTime;
    return client.pollingInterval;
  })();
  const observerId = stringify([
    "waitForTransactionReceipt",
    client.uid,
    hash3,
    // Concurrent calls with different behavior-defining options must not
    // share an observer: the first call's polling closure decides timeout,
    // confirmations, polling interval and replacement checks for everyone.
    {
      checkReplacement,
      confirmations,
      pollingInterval,
      retryCount,
      timeout
    }
  ]);
  let transaction;
  let replacedTransaction;
  let receipt;
  let retrying = false;
  let _unobserve;
  let _unwatch;
  const { promise, resolve, reject } = withResolvers();
  const timer = timeout ? setTimeout(() => {
    _unwatch?.();
    _unobserve?.();
    reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 }));
  }, timeout) : void 0;
  _unobserve = observe(observerId, { onReplaced, resolve, reject }, async (emit) => {
    receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 }).catch(() => void 0);
    if (receipt && confirmations <= 1) {
      clearTimeout(timer);
      emit.resolve(receipt);
      _unobserve?.();
      return;
    }
    _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
      emitMissed: true,
      emitOnBegin: true,
      poll: true,
      pollingInterval,
      async onBlockNumber(blockNumber_) {
        const done = /* @__PURE__ */ __name((fn) => {
          clearTimeout(timer);
          _unwatch?.();
          fn();
          _unobserve?.();
        }, "done");
        let blockNumber = blockNumber_;
        if (retrying)
          return;
        try {
          if (receipt) {
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
            return;
          }
          if (checkReplacement && !transaction) {
            retrying = true;
            await withRetry(async () => {
              transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash3 });
              if (transaction.blockNumber)
                blockNumber = transaction.blockNumber;
            }, {
              delay: retryDelay,
              retryCount
            });
            retrying = false;
          }
          receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 });
          if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
            return;
          done(() => emit.resolve(receipt));
        } catch (err) {
          if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
            if (!transaction) {
              retrying = false;
              return;
            }
            if (transaction.blockNumber) {
              retrying = false;
              return;
            }
            try {
              replacedTransaction = transaction;
              retrying = true;
              const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                blockNumber,
                includeTransactions: true
              }), {
                delay: retryDelay,
                retryCount,
                shouldRetry: ({ error }) => error instanceof BlockNotFoundError
              });
              retrying = false;
              const replacedKey = getReplacementKey(replacedTransaction);
              const replacementTransaction = block.transactions.find((candidate) => isAddressEqual(candidate.from, replacedTransaction.from) && candidate.hash !== replacedTransaction.hash && getReplacementKey(candidate) === replacedKey);
              if (!replacementTransaction)
                return;
              receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                hash: replacementTransaction.hash
              });
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              const reason = client.chain?.transactionReplacement?.getReason?.({
                replaced: replacedTransaction,
                replacement: replacementTransaction
              }) ?? getReplacementReason(replacedTransaction, replacementTransaction);
              done(() => {
                emit.onReplaced?.({
                  reason,
                  replacedTransaction,
                  transaction: replacementTransaction,
                  transactionReceipt: receipt
                });
                emit.resolve(receipt);
              });
            } catch (err_) {
              done(() => emit.reject(err_));
            }
          } else {
            done(() => emit.reject(err));
          }
        }
      }
    });
  });
  return promise;
}
function getReplacementReason(replaced, replacement) {
  if ((replacement.to && replaced.to ? isAddressEqual(replacement.to, replaced.to) : replacement.to === replaced.to) && replacement.value === replaced.value && replacement.input === replaced.input)
    return "repriced";
  if (replacement.from === replacement.to && replacement.value === 0n)
    return "cancelled";
  return "replaced";
}
var init_waitForTransactionReceipt = __esm({
  "node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js"() {
    init_block();
    init_transaction();
    init_isAddressEqual();
    init_getAction();
    init_observe();
    init_withResolvers();
    init_withRetry();
    init_stringify();
    init_getBlock();
    init_getTransaction();
    init_getTransactionReceipt();
    init_watchBlockNumber();
    __name(waitForTransactionReceipt, "waitForTransactionReceipt");
    __name(getReplacementReason, "getReplacementReason");
  }
});

// node_modules/viem/_esm/actions/token/internal.js
function toAmount(amount, decimals) {
  return { amount, decimals, formatted: formatUnits(amount, decimals) };
}
function toBaseUnits(amount, decimals) {
  if (typeof amount === "bigint")
    return amount;
  const resolved = amount.decimals ?? decimals;
  return parseUnits(amount.formatted, requireTokenDecimals(resolved));
}
function requireTokenDecimals(decimals) {
  if (decimals === void 0)
    throw new Error("Token decimals are required. Pass `amount.decimals` or select a declared token.");
  return decimals;
}
function resolveAmountDecimals(amount, decimals) {
  if (typeof amount === "bigint")
    return decimals;
  return amount.decimals ?? decimals;
}
function resolveToken(client, parameters) {
  const { decimals, token } = parameters;
  const declared = findDeclaredToken(client, token);
  if (declared)
    return {
      address: declared.address,
      decimals: decimals ?? declared.decimals
    };
  if (isAddress(token, { strict: false }))
    return {
      address: token,
      decimals: decimals ?? inferDecimals(client, token)
    };
  throw new Error(`Token "${token}" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.`);
}
function findDeclaredToken(client, token) {
  const tokens = client.tokens;
  const chainId = client.chain?.id;
  if (!tokens || chainId === void 0)
    return void 0;
  const bySymbol = findTokenBySymbol(tokens, token);
  if (bySymbol)
    return resolveTokenForChain(bySymbol, chainId);
  if (isAddress(token, { strict: false }))
    for (const token_ of tokens) {
      const resolved = resolveTokenForChain(token_, chainId);
      if (resolved && isAddressEqual(resolved.address, token))
        return resolved;
    }
  return void 0;
}
function resolveTokenForChain(token, chainId) {
  const address = token.addresses[chainId];
  if (!address)
    return void 0;
  return {
    address,
    currency: token.currency,
    decimals: token.decimals,
    name: token.name,
    popular: token.popular,
    symbol: token.symbol
  };
}
function findTokenBySymbol(tokens, symbol) {
  const lowerSymbol = symbol.toLowerCase();
  for (const token of tokens) {
    if (token.symbol?.toLowerCase() === lowerSymbol)
      return token;
  }
  return void 0;
}
function inferDecimals(client, address) {
  const tokens = client.tokens;
  const chainId = client.chain?.id;
  if (tokens && chainId !== void 0)
    for (const token of tokens) {
      const resolved = resolveTokenForChain(token, chainId);
      if (resolved && isAddressEqual(resolved.address, address))
        return resolved.decimals;
    }
  return void 0;
}
async function resolveTokenWithDecimals(client, parameters) {
  const { address, decimals } = resolveToken(client, parameters);
  if (decimals !== void 0)
    return { address, decimals };
  return {
    address,
    decimals: await readContract(client, {
      abi: erc20Abi,
      address,
      functionName: "decimals"
    })
  };
}
function pickWriteParameters(parameters) {
  const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } = parameters;
  return { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce };
}
function defineCall(call2) {
  return {
    ...call2,
    data: encodeFunctionData(call2),
    to: call2.address
  };
}
var init_internal = __esm({
  "node_modules/viem/_esm/actions/token/internal.js"() {
    init_abis();
    init_isAddress();
    init_isAddressEqual();
    init_utils5();
    init_formatUnits();
    init_parseUnits();
    init_readContract();
    __name(toAmount, "toAmount");
    __name(toBaseUnits, "toBaseUnits");
    __name(requireTokenDecimals, "requireTokenDecimals");
    __name(resolveAmountDecimals, "resolveAmountDecimals");
    __name(resolveToken, "resolveToken");
    __name(findDeclaredToken, "findDeclaredToken");
    __name(resolveTokenForChain, "resolveTokenForChain");
    __name(findTokenBySymbol, "findTokenBySymbol");
    __name(inferDecimals, "inferDecimals");
    __name(resolveTokenWithDecimals, "resolveTokenWithDecimals");
    __name(pickWriteParameters, "pickWriteParameters");
    __name(defineCall, "defineCall");
  }
});

// node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js
async function sendRawTransactionSync(client, { serializedTransaction, throwOnReceiptRevert, timeout }) {
  const receipt = await client.request({
    method: "eth_sendRawTransactionSync",
    params: timeout ? [serializedTransaction, timeout] : [serializedTransaction]
  }, { retryCount: 0 });
  const format2 = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  const formatted = format2(receipt);
  if (formatted.status === "reverted" && throwOnReceiptRevert)
    throw new TransactionReceiptRevertedError({ receipt: formatted });
  return formatted;
}
var init_sendRawTransactionSync = __esm({
  "node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js"() {
    init_transaction();
    init_transactionReceipt();
    __name(sendRawTransactionSync, "sendRawTransactionSync");
  }
});

// node_modules/viem/_esm/actions/wallet/sendTransactionSync.js
async function sendTransactionSync(client, parameters) {
  const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, pollingInterval, throwOnReceiptRevert, type, value, ...rest } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransactionSync"
    });
  const account = account_ ? parseAccount(account_) : null;
  let nonceManagerParameters;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return void 0;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return void 0;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        if (assertChainId)
          assertCurrentChain({
            currentChainId: chainId,
            chain
          });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format2 = chainFormat || formatTransactionRequest;
      const request = format2({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace2.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      const hash3 = await (async () => {
        try {
          return await client.request({
            method,
            params: [request]
          }, { retryCount: 0 });
        } catch (e) {
          if (isWalletNamespaceSupported === false)
            throw e;
          const error = e;
          if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
            return await client.request({
              method: "wallet_sendTransaction",
              params: [request]
            }, { retryCount: 0 }).then((hash4) => {
              supportsWalletNamespace2.set(client.uid, true);
              return hash4;
            }).catch((e2) => {
              const walletNamespaceError = e2;
              if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
                supportsWalletNamespace2.set(client.uid, false);
                throw error;
              }
              throw walletNamespaceError;
            });
          }
          throw error;
        }
      })();
      const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({
        checkReplacement: false,
        hash: hash3,
        pollingInterval,
        timeout
      });
      if (throwOnReceiptRevert && receipt.status === "reverted")
        throw new TransactionReceiptRevertedError({ receipt });
      return receipt;
    }
    if (account?.type === "local") {
      const nonceManager = (() => {
        if (!account.nonceManager || typeof nonce !== "undefined")
          return account.nonceManager;
        const nonceManager2 = account.nonceManager;
        return {
          consume(parameters2) {
            nonceManagerParameters = {
              address: parameters2.address,
              chainId: parameters2.chainId
            };
            return nonceManager2.consume(parameters2);
          },
          get(parameters2) {
            return nonceManager2.get(parameters2);
          },
          increment(parameters2) {
            return nonceManager2.increment(parameters2);
          },
          reset(parameters2) {
            return nonceManager2.reset(parameters2);
          }
        };
      })();
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const signedTransaction = await account.signTransaction(request, {
        serializer
      });
      const transactionEnvelope = (chain ?? client.chain)?.serializers?.transactionEnvelope;
      const serializedTransaction = transactionEnvelope ? await transactionEnvelope({
        serializedTransaction: signedTransaction,
        transaction: request
      }) : signedTransaction;
      return await getAction(client, sendRawTransactionSync, "sendRawTransactionSync")({
        serializedTransaction,
        throwOnReceiptRevert,
        timeout: parameters.timeout
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransactionSync",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    if (nonceManagerParameters && !(err instanceof TransactionReceiptRevertedError))
      account?.nonceManager?.reset(nonceManagerParameters);
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}
var supportsWalletNamespace2;
var init_sendTransactionSync = __esm({
  "node_modules/viem/_esm/actions/wallet/sendTransactionSync.js"() {
    init_parseAccount();
    init_account();
    init_base();
    init_transaction();
    init_recoverAuthorizationAddress();
    init_assertCurrentChain();
    init_concat();
    init_getTransactionError();
    init_extract();
    init_transactionRequest();
    init_getAction();
    init_lru();
    init_assertRequest();
    init_getChainId();
    init_waitForTransactionReceipt();
    init_prepareTransactionRequest();
    init_sendRawTransactionSync();
    supportsWalletNamespace2 = new LruMap(128);
    __name(sendTransactionSync, "sendTransactionSync");
  }
});

// node_modules/viem/_esm/actions/wallet/writeContractSync.js
async function writeContractSync(client, parameters) {
  return writeContract.internal(client, sendTransactionSync, "sendTransactionSync", parameters);
}
var init_writeContractSync = __esm({
  "node_modules/viem/_esm/actions/wallet/writeContractSync.js"() {
    init_sendTransactionSync();
    init_writeContract();
    __name(writeContractSync, "writeContractSync");
  }
});

// src/worker/http.ts
function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
      ...headers
    }
  });
}
__name(json, "json");
function corsOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type, x-payment, x-agent-id, x-sync-key, authorization",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-max-age": "86400"
    }
  });
}
__name(corsOptionsResponse, "corsOptionsResponse");
function withCors(res) {
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", "*");
  return new Response(res.body, { status: res.status, headers: h });
}
__name(withCors, "withCors");

// src/worker/rate-limit.ts
async function checkRateLimit(env, cfg) {
  const now = Date.now();
  const bucketStart = Math.floor(now / (cfg.windowSeconds * 1e3));
  const fullKey = `${cfg.key}:${bucketStart}`;
  const curRaw = await env.KV.get(fullKey);
  const cur = curRaw ? parseInt(curRaw, 10) : 0;
  const remaining = Math.max(0, cfg.limit - cur);
  const resetAt = (bucketStart + 1) * cfg.windowSeconds * 1e3;
  if (cur >= cfg.limit) {
    return { ok: false, remaining: 0, resetAt };
  }
  await env.KV.put(fullKey, String(cur + 1), { expirationTtl: cfg.windowSeconds * 2 });
  return { ok: true, remaining: remaining - 1, resetAt };
}
__name(checkRateLimit, "checkRateLimit");
function requestIdentity(req) {
  return req.headers.get("x-agent-id") ?? req.headers.get("cf-connecting-ip") ?? "anon";
}
__name(requestIdentity, "requestIdentity");
function requestIp(req) {
  return req.headers.get("cf-connecting-ip") ?? "0.0.0.0";
}
__name(requestIp, "requestIp");
function hasUserAgent(req) {
  const ua = req.headers.get("user-agent");
  return !!ua && ua.trim().length > 0;
}
__name(hasUserAgent, "hasUserAgent");

// src/worker/verify.ts
async function handleVerify(req, env) {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId(req.url, "/verify/");
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const d1Status = await env.DB.prepare(
    "SELECT status FROM packages WHERE package_id = ?"
  ).bind(id).first();
  if (d1Status === "recalled") {
    return json({ error: "not_found" }, 404);
  }
  if (!d1Status) {
    return json({ error: "not_found" }, 404);
  }
  const limit = parseInt(env.VERIFY_RATE_LIMIT_PER_MIN || "60", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:verify:${requestIp(req)}`,
    limit,
    windowSeconds: 60
  });
  if (!rl.ok) {
    return json({ error: "rate_limited", retry_after_ms: rl.resetAt - Date.now() }, 429);
  }
  const agentId = requestIdentity(req);
  const verification = await env.KV.get(`verify:${id}`, "json");
  if (!verification) {
    return json({ error: "not_found" }, 404);
  }
  return json(verification, 200, {
    "cache-control": "public, max-age=60",
    "x-remaining-rate-limit": String(rl.remaining)
  });
}
__name(handleVerify, "handleVerify");
function parseId(url, prefix) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] !== prefix.slice(1, -1))
    return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]) : null;
}
__name(parseId, "parseId");

// src/worker/preview.ts
async function handlePreview(req, env) {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId2(req.url, "/preview/");
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const d1Status = await env.DB.prepare(
    "SELECT status FROM packages WHERE package_id = ?"
  ).bind(id).first();
  if (d1Status === "recalled" || !d1Status) {
    return json({ error: "not_found" }, 404);
  }
  const agentId = requestIdentity(req);
  const limit = parseInt(env.PREVIEW_RATE_LIMIT_PER_HOUR || "10", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:preview:${agentId}`,
    limit,
    windowSeconds: 3600
  });
  if (!rl.ok) {
    return json({ error: "rate_limited", retry_after_ms: rl.resetAt - Date.now() }, 429);
  }
  const pkg = await env.KV.get(`pkg:${id}`, "json");
  if (!pkg) {
    return json({ error: "not_found" }, 404);
  }
  const verification = await env.KV.get(`verify:${id}`, "json");
  const raw = pkg.data ?? pkg;
  const preview = excerptRecords(raw, 3);
  return json({
    package_id: id,
    preview: true,
    title: pkg.title,
    records: preview,
    total_records: Array.isArray(raw) ? raw.length : 1,
    verification_summary: verification ? {
      q: verification.q,
      evidence_count: verification.evidence_count,
      verified_at: verification.verified_at,
      expires_at: verification.expires_at
    } : null,
    full_url: `${env.OWNSITE_BASE}/buy/${id}`
  });
}
__name(handlePreview, "handlePreview");
function excerptRecords(data, n) {
  if (Array.isArray(data))
    return data.slice(0, n);
  if (data && typeof data === "object" && "records" in data) {
    const arr = data.records;
    if (Array.isArray(arr))
      return arr.slice(0, n);
  }
  if (data && typeof data === "object") {
    const obj = data;
    const keys = Object.keys(obj).slice(0, n);
    return Object.fromEntries(keys.map((k) => [k, obj[k]]));
  }
  return [data];
}
__name(excerptRecords, "excerptRecords");
function parseId2(url, prefix) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] !== prefix.slice(1, -1))
    return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]) : null;
}
__name(parseId2, "parseId");

// src/worker/status.ts
async function handleStatus(req, env) {
  if (!hasUserAgent(req)) {
    return json({ error: "user_agent_required" }, 400);
  }
  const id = parseId3(req.url, "/status/");
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const limit = parseInt(env.VERIFY_RATE_LIMIT_PER_MIN || "60", 10);
  const rl = await checkRateLimit(env, {
    key: `rl:status:${requestIp(req)}`,
    limit,
    windowSeconds: 60
  });
  if (!rl.ok)
    return json({ error: "rate_limited" }, 429);
  const d1Row = await env.DB.prepare(
    "SELECT status FROM packages WHERE package_id = ?"
  ).bind(id).first();
  if (!d1Row) {
    return json({ package_id: id, status: "not_found", replacement_package_id: null }, 404);
  }
  if (d1Row.status === "recalled") {
    const replacement2 = await env.KV.get(`replacement:${id}`);
    return json({
      package_id: id,
      status: "recalled",
      replacement_package_id: replacement2 ?? null
    }, 200);
  }
  const status = d1Row.status;
  const replacement = await env.KV.get(`replacement:${id}`);
  return json({
    package_id: id,
    status,
    replacement_package_id: replacement ?? null
  });
}
__name(handleStatus, "handleStatus");
function parseId3(url, prefix) {
  const u = new URL(url);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] !== prefix.slice(1, -1))
    return null;
  return parts.length === 2 ? decodeURIComponent(parts[1]) : null;
}
__name(parseId3, "parseId");

// src/shared/constants.ts
var LISTED_MIN_Q = 0.72;
var LISTED_MIN_EVIDENCE = 4;
var RECALL_Q_THRESHOLD = 0.68;
var PRICE_STANDARD_6DECIMAL = "500000";
var PRICE_FEATURED_6DECIMAL = "1000000";
var TX_REPLAY_TTL_SECONDS = 30 * 24 * 3600;

// src/worker/pseudonym.ts
async function derivePseudonym(payer) {
  const normalized = payer.toLowerCase().trim();
  const enc = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  return "psn_" + hex;
}
__name(derivePseudonym, "derivePseudonym");

// src/worker/settle-record.ts
async function recordSettle(env, input) {
  await env.DB.prepare(
    `INSERT INTO settle_attempts (tx_hash, package_id, facilitator, attempt, result, amount_usdc, payer, network, latency_ms, error, called_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    input.txHash,
    input.packageId,
    input.facilitator,
    input.attempt,
    input.result,
    input.amountUsdc ?? null,
    input.payer ?? null,
    input.network,
    input.latencyMs ?? null,
    input.error ?? null,
    (/* @__PURE__ */ new Date()).toISOString()
  ).run();
}
__name(recordSettle, "recordSettle");

// src/facilitator/cdp.ts
var CDPFacilitator = class {
  name = "cdp";
  async healthCheck(env) {
    if (!env.FACILITATOR_URL)
      return { ok: false, error: "no_url" };
    if (!env.CDP_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${env.FACILITATOR_URL}/health`, {
        headers: { "cdp-api-key": env.CDP_API_KEY }
      });
      return r.ok ? { ok: true } : { ok: false, error: `http_${r.status}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async settle(env, req) {
    const t0 = Date.now();
    const latencyMs = /* @__PURE__ */ __name(() => Date.now() - t0, "latencyMs");
    if (!env.FACILITATOR_URL)
      return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_url" };
    if (!env.CDP_API_KEY)
      return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_api_key" };
    if (!env.PAY_TO)
      return { ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_pay_to" };
    try {
      const r = await fetch(env.FACILITATOR_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cdp-api-key": env.CDP_API_KEY
        },
        body: JSON.stringify({
          paymentPayload: req.payment,
          paymentRequirements: {
            scheme: "exact",
            network: env.NETWORK,
            maxAmountRequired: req.amountRequired || PRICE_STANDARD_6DECIMAL,
            resource: `${env.OWNSITE_BASE}/buy/${req.packageId}`,
            payTo: env.PAY_TO,
            asset: env.ASSET_USDC,
            extra: { name: "USDC", version: "2" }
          }
        })
      });
      const body = await r.json();
      return {
        ok: !!body.isValid,
        amount: body.amount ?? "0",
        payer: body.payer ?? req.payment.payload?.payer ?? "unknown",
        txHash: req.payment.payload?.txHash ?? "",
        error: body.error,
        latencyMs: latencyMs()
      };
    } catch (e) {
      return {
        ok: false,
        amount: "0",
        payer: "unknown",
        txHash: "",
        error: e instanceof Error ? e.message : "network",
        latencyMs: latencyMs()
      };
    }
  }
};
__name(CDPFacilitator, "CDPFacilitator");

// node_modules/viem/_esm/actions/wallet/waitForCallsStatus.js
init_base();

// node_modules/viem/_esm/errors/calls.js
init_base();
var BundleFailedError = class extends BaseError2 {
  constructor(result) {
    super(`Call bundle failed with status: ${result.statusCode}`, {
      name: "BundleFailedError"
    });
    Object.defineProperty(this, "result", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.result = result;
  }
};
__name(BundleFailedError, "BundleFailedError");

// node_modules/viem/_esm/actions/wallet/waitForCallsStatus.js
init_getAction();
init_observe();
init_poll();
init_withResolvers();
init_withRetry();
init_stringify();

// node_modules/viem/_esm/actions/wallet/getCallsStatus.js
init_slice();
init_trim();
init_fromHex();
init_transactionReceipt();

// node_modules/viem/_esm/actions/wallet/sendCalls.js
init_parseAccount();
init_base();
init_rpc();
init_encodeFunctionData();
init_concat();
init_fromHex();
init_toHex();
init_getTransactionError();
init_sendTransaction();
var fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792";
var fallbackTransactionErrorMagicIdentifier = numberToHex(0, {
  size: 32
});
async function sendCalls(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, experimental_fallback, experimental_fallbackDelay = 32, forceAtomic = false, id, version: version4 = "2.0.0" } = parameters;
  const account = account_ ? parseAccount(account_) : null;
  let capabilities = parameters.capabilities;
  if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === "string")
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true }
      };
    else
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...client.dataSuffix.required ? {} : { optional: true }
        }
      };
  }
  const calls = parameters.calls.map((call_) => {
    const call2 = call_;
    const data = call2.abi ? encodeFunctionData({
      abi: call2.abi,
      functionName: call2.functionName,
      args: call2.args
    }) : call2.data;
    return {
      data: call2.dataSuffix && data ? concat([data, call2.dataSuffix]) : data,
      to: call2.to,
      value: call2.value ? numberToHex(call2.value) : void 0
    };
  });
  try {
    const response = await client.request({
      method: "wallet_sendCalls",
      params: [
        {
          atomicRequired: forceAtomic,
          calls,
          capabilities,
          chainId: numberToHex(chain.id),
          from: account?.address,
          id,
          version: version4
        }
      ]
    }, { retryCount: 0 });
    if (typeof response === "string")
      return { id: response };
    return response;
  } catch (err) {
    const error = err;
    if (experimental_fallback && (error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.name === "UnknownRpcError" || error.details.toLowerCase() === "this request method is not supported" || error.details.toLowerCase().includes("does not exist / is not available") || error.details.toLowerCase().includes("missing or invalid. request()") || error.details.toLowerCase().includes("did not match any variant of untagged enum") || error.details.toLowerCase().includes("account upgraded to unsupported contract") || error.details.toLowerCase().includes("eip-7702 not supported") || error.details.toLowerCase().includes("unsupported wc_ method") || // magic.link
    error.details.toLowerCase().includes("feature toggled misconfigured") || // Trust Wallet
    error.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some((capability) => !capability.optional);
        if (hasNonOptionalCapability) {
          const message = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
          throw new UnsupportedNonOptionalCapabilityError(new BaseError2(message, {
            details: message
          }));
        }
      }
      if (forceAtomic && calls.length > 1) {
        const message = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
        throw new AtomicityNotSupportedError(new BaseError2(message, {
          details: message
        }));
      }
      const results = [];
      for (const call2 of calls) {
        try {
          const value = await sendTransaction(client, {
            account,
            chain,
            data: call2.data,
            to: call2.to,
            value: call2.value ? hexToBigInt(call2.value) : void 0
          });
          results.push({ status: "fulfilled", value });
        } catch (reason) {
          results.push({ reason, status: "rejected" });
        }
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) => setTimeout(resolve, experimental_fallbackDelay));
      }
      if (results.every((r) => r.status === "rejected"))
        throw results[0].reason;
      const hashes = results.map((result) => {
        if (result.status === "fulfilled")
          return result.value;
        return fallbackTransactionErrorMagicIdentifier;
      });
      return {
        id: concat([
          ...hashes,
          numberToHex(chain.id, { size: 32 }),
          fallbackMagicIdentifier
        ])
      };
    }
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain
    });
  }
}
__name(sendCalls, "sendCalls");

// node_modules/viem/_esm/actions/wallet/getCallsStatus.js
async function getCallsStatus(client, parameters) {
  async function getStatus(id) {
    const isTransactions = id.endsWith(fallbackMagicIdentifier.slice(2));
    if (isTransactions) {
      const chainId2 = trim(sliceHex(id, -64, -32));
      const hashes = sliceHex(id, 0, -64).slice(2).match(/.{1,64}/g);
      const receipts2 = await Promise.all(hashes.map((hash3) => fallbackTransactionErrorMagicIdentifier.slice(2) !== hash3 ? client.request({
        method: "eth_getTransactionReceipt",
        params: [`0x${hash3}`]
      }, { dedupe: true }) : void 0));
      const status2 = (() => {
        if (receipts2.some((r) => r === null))
          return 100;
        if (receipts2.every((r) => r?.status === "0x1"))
          return 200;
        if (receipts2.every((r) => r?.status === "0x0"))
          return 500;
        return 600;
      })();
      return {
        atomic: false,
        chainId: hexToNumber(chainId2),
        receipts: receipts2.filter(Boolean),
        status: status2,
        version: "2.0.0"
      };
    }
    return client.request({
      method: "wallet_getCallsStatus",
      params: [id]
    });
  }
  __name(getStatus, "getStatus");
  const { atomic = false, chainId, receipts, version: version4 = "2.0.0", ...response } = await getStatus(parameters.id);
  const [status, statusCode] = (() => {
    const statusCode2 = response.status;
    if (statusCode2 >= 100 && statusCode2 < 200)
      return ["pending", statusCode2];
    if (statusCode2 >= 200 && statusCode2 < 300)
      return ["success", statusCode2];
    if (statusCode2 >= 300 && statusCode2 < 700)
      return ["failure", statusCode2];
    if (statusCode2 === "CONFIRMED")
      return ["success", 200];
    if (statusCode2 === "PENDING")
      return ["pending", 100];
    return [void 0, statusCode2];
  })();
  return {
    ...response,
    atomic,
    // @ts-expect-error: for backwards compatibility
    chainId: chainId ? hexToNumber(chainId) : void 0,
    receipts: receipts?.map((receipt) => ({
      ...receipt,
      blockNumber: hexToBigInt(receipt.blockNumber),
      gasUsed: hexToBigInt(receipt.gasUsed),
      status: receiptStatuses[receipt.status]
    })) ?? [],
    statusCode,
    status,
    version: version4
  };
}
__name(getCallsStatus, "getCallsStatus");

// node_modules/viem/_esm/actions/wallet/waitForCallsStatus.js
var functionIds = /* @__PURE__ */ new WeakMap();
var functionCount = 0;
function getFunctionId(fn) {
  let fnId = functionIds.get(fn);
  if (fnId === void 0) {
    fnId = ++functionCount;
    functionIds.set(fn, fnId);
  }
  return fnId;
}
__name(getFunctionId, "getFunctionId");
async function waitForCallsStatus(client, parameters) {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = /* @__PURE__ */ __name(({ statusCode }) => statusCode === 200 || statusCode >= 300, "status"),
    retryCount = 4,
    retryDelay = /* @__PURE__ */ __name(({ count }) => ~~(1 << count) * 200, "retryDelay"),
    // exponential backoff
    timeout = 6e4,
    throwOnFailure = false
  } = parameters;
  const observerId = stringify([
    "waitForCallsStatus",
    client.uid,
    id,
    // Concurrent calls with different behavior-defining options must not
    // share an observer: the first call's polling closure decides the
    // status check, failure handling and retry behavior for everyone.
    // `timeout` is enforced per caller below, so it is not included.
    {
      pollingInterval,
      retryCount,
      // Caller-provided functions are keyed by identity, not source text:
      // two predicates built by the same factory have identical source
      // but capture different values, so they must not share an observer.
      // Keying on `parameters.*` (not the destructured defaults) keeps
      // calls that use the defaults on one shared observer, since the
      // default functions are recreated on every call.
      retryDelay: typeof parameters.retryDelay === "function" ? ["function", getFunctionId(parameters.retryDelay)] : parameters.retryDelay,
      status: parameters.status ? getFunctionId(parameters.status) : void 0,
      throwOnFailure
    }
  ]);
  const { promise, resolve, reject } = withResolvers();
  let timer;
  const unobserve = observe(observerId, { resolve, reject }, (emit) => {
    const unpoll = poll(async () => {
      const done = /* @__PURE__ */ __name((fn) => {
        clearTimeout(timer);
        unpoll();
        fn();
        unobserve();
      }, "done");
      try {
        const result = await withRetry(async () => {
          const result2 = await getAction(client, getCallsStatus, "getCallsStatus")({ id });
          if (throwOnFailure && result2.status === "failure")
            throw new BundleFailedError(result2);
          return result2;
        }, {
          retryCount,
          delay: retryDelay
        });
        if (!status(result))
          return;
        done(() => emit.resolve(result));
      } catch (error) {
        done(() => emit.reject(error));
      }
    }, {
      interval: pollingInterval,
      emitOnBegin: true
    });
    return unpoll;
  });
  timer = timeout ? setTimeout(() => {
    unobserve();
    clearTimeout(timer);
    reject(new WaitForCallsStatusTimeoutError({ id }));
  }, timeout) : void 0;
  return await promise.finally(() => unobserve());
}
__name(waitForCallsStatus, "waitForCallsStatus");
var WaitForCallsStatusTimeoutError = class extends BaseError2 {
  constructor({ id }) {
    super(`Timed out while waiting for call bundle with id "${id}" to be confirmed.`, { name: "WaitForCallsStatusTimeoutError" });
  }
};
__name(WaitForCallsStatusTimeoutError, "WaitForCallsStatusTimeoutError");

// node_modules/viem/_esm/clients/createClient.js
init_parseAccount();

// node_modules/viem/_esm/utils/uid.js
var size4 = 256;
var index = size4;
var buffer;
function uid(length = 11) {
  if (!buffer || index + length > size4 * 2) {
    buffer = "";
    index = 0;
    for (let i = 0; i < size4; i++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}
__name(uid, "uid");

// node_modules/viem/_esm/clients/createClient.js
function createClient(parameters) {
  const { batch, chain, ccipRead, dataSuffix, key = "base", name = "Base Client", tokens, type = "base" } = parameters;
  const experimental_blockTag = parameters.experimental_blockTag ?? (typeof chain?.experimental_preconfirmationTime === "number" ? "pending" : void 0);
  const blockTime = chain?.blockTime ?? 12e3;
  const defaultPollingInterval = Math.min(Math.max(Math.floor(blockTime / 2), 500), 4e3);
  const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval;
  const cacheTime = parameters.cacheTime ?? pollingInterval;
  const account = parameters.account ? parseAccount(parameters.account) : void 0;
  const { config, request, value } = parameters.transport({
    account,
    chain,
    pollingInterval
  });
  const transport = { ...config, ...value };
  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    key,
    name,
    pollingInterval,
    request,
    tokens,
    transport,
    type,
    uid: uid(),
    ...experimental_blockTag ? { experimental_blockTag } : {}
  };
  return decorate(client);
}
__name(createClient, "createClient");
var scopes_builtin = /* @__PURE__ */ new WeakSet();
var scopeId = 0;
function decorate(client) {
  function extend(base2, extensions) {
    return (extendFn) => {
      const extended = extendFn(base2);
      for (const key in client)
        if (key !== "scope")
          delete extended[key];
      const combined = { ...base2, ...extended };
      for (const key in extended) {
        const a = base2[key];
        const b = extended[key];
        if (isPlainObject(a) && isPlainObject(b))
          combined[key] = { ...a, ...b };
      }
      const next = [...extensions, extendFn];
      const { scope: scope_combined } = combined;
      return Object.assign(combined, {
        extend: extend(combined, next),
        scope: typeof scope_combined === "function" && scopes_builtin.has(scope_combined) ? scope(next) : scope_combined
      });
    };
  }
  __name(extend, "extend");
  function scope(extensions) {
    const scopes = /* @__PURE__ */ new WeakMap();
    const fn = /* @__PURE__ */ __name((options = {}) => {
      const cached = options.signal && scopes.get(options.signal);
      if (cached)
        return cached;
      const id = `scope.${scopeId++}`;
      const controller = new AbortController();
      const { signal } = options;
      if (signal?.aborted)
        controller.abort(signal.reason);
      else
        signal?.addEventListener("abort", () => controller.abort(signal.reason), {
          once: true
        });
      const request = /* @__PURE__ */ __name((args, options_request) => client.request(args, {
        ...options_request,
        signal: options_request?.signal ?? controller.signal,
        // The request `uid` keys in-flight request deduplication.
        uid: options_request?.uid ?? id
      }), "request");
      const scoped = extensions.reduce((base2, extendFn) => base2.extend(extendFn), decorate({ ...client, request, uid: id }));
      if (signal)
        scopes.set(signal, scoped);
      return scoped;
    }, "fn");
    scopes_builtin.add(fn);
    return fn;
  }
  __name(scope, "scope");
  return Object.assign(client, {
    extend: extend(client, []),
    scope: scope([])
  });
}
__name(decorate, "decorate");
function isPlainObject(value) {
  if (typeof value !== "object" || value === null)
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
__name(isPlainObject, "isPlainObject");
function bindActionDecorators(client, action) {
  const wrapped = /* @__PURE__ */ __name((parameters = {}) => action(client, parameters), "wrapped");
  for (const key of [
    "call",
    "calls",
    "callWithPeriod",
    "estimateGas",
    "prepare",
    "prepareRecipient",
    "predict",
    "simulate"
  ])
    if (Object.hasOwn(action, key)) {
      const helper = action[key];
      wrapped[key] = (args = {}) => {
        if (helper.length === 1)
          return helper(args);
        return helper(client, args);
      };
    }
  for (const key of ["extractEvent", "extractEvents"])
    if (Object.hasOwn(action, key))
      wrapped[key] = action[key];
  return wrapped;
}
__name(bindActionDecorators, "bindActionDecorators");

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getAddress();
init_getChainContractAddress();
init_size();
init_trim();
init_toHex();

// node_modules/viem/_esm/utils/ens/errors.js
init_base();
init_contract();
function isNullUniversalResolverError(err) {
  if (!(err instanceof BaseError2))
    return false;
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(cause instanceof ContractFunctionRevertedError))
    return false;
  if (cause.data?.errorName === "HttpError")
    return true;
  if (cause.data?.errorName === "ResolverError")
    return true;
  if (cause.data?.errorName === "ResolverNotContract")
    return true;
  if (cause.data?.errorName === "ResolverNotFound")
    return true;
  if (cause.data?.errorName === "ReverseAddressMismatch")
    return true;
  if (cause.data?.errorName === "UnsupportedResolverProfile")
    return true;
  return false;
}
__name(isNullUniversalResolverError, "isNullUniversalResolverError");

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
init_localBatchGatewayRequest();

// node_modules/viem/_esm/utils/ens/namehash.js
init_concat();
init_toBytes();
init_toHex();
init_keccak256();

// node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
init_isHex();
function encodedLabelToLabelhash(label) {
  if (label.length !== 66)
    return null;
  if (label.indexOf("[") !== 0)
    return null;
  if (label.indexOf("]") !== 65)
    return null;
  const hash3 = `0x${label.slice(1, 65)}`;
  if (!isHex(hash3))
    return null;
  return hash3;
}
__name(encodedLabelToLabelhash, "encodedLabelToLabelhash");

// node_modules/viem/_esm/utils/ens/namehash.js
function namehash(name) {
  let result = new Uint8Array(32).fill(0);
  if (!name)
    return bytesToHex(result);
  const labels = name.split(".");
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
    const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
    result = keccak256(concat([result, hashed]), "bytes");
  }
  return bytesToHex(result);
}
__name(namehash, "namehash");

// node_modules/viem/_esm/utils/ens/packetToBytes.js
init_toBytes();

// node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash3) {
  return `[${hash3.slice(2)}]`;
}
__name(encodeLabelhash, "encodeLabelhash");

// node_modules/viem/_esm/utils/ens/labelhash.js
init_toBytes();
init_toHex();
init_keccak256();
function labelhash(label) {
  const result = new Uint8Array(32).fill(0);
  if (!label)
    return bytesToHex(result);
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}
__name(labelhash, "labelhash");

// node_modules/viem/_esm/utils/ens/packetToBytes.js
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0)
    return new Uint8Array(1);
  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
  let offset = 0;
  const list = value.split(".");
  for (let i = 0; i < list.length; i++) {
    let encoded = stringToBytes(list[i]);
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }
  if (bytes.byteLength !== offset + 1)
    return bytes.slice(0, offset + 1);
  return bytes;
}
__name(packetToBytes, "packetToBytes");

// node_modules/viem/_esm/actions/ens/getEnsAddress.js
init_getAction();
init_readContract();
async function getEnsAddress(client, parameters) {
  const { blockNumber, blockTag, coinType, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  const args = (() => {
    if (coinType != null)
      return [namehash(name), BigInt(coinType)];
    return [namehash(name)];
  })();
  try {
    const functionData = encodeFunctionData({
      abi: addressResolverAbi,
      functionName: "addr",
      args
    });
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolveWithGateways",
      args: [
        toHex(packetToBytes(name)),
        functionData,
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const address = decodeAddress2({ coinType, data: res[0], args });
    if (address === "0x")
      return null;
    if (trim(address) === "0x00")
      return null;
    return address;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsAddress, "getEnsAddress");
function decodeAddress2({ coinType, data, args }) {
  try {
    return decodeFunctionResult({
      abi: addressResolverAbi,
      args,
      functionName: "addr",
      data
    });
  } catch (err) {
    if (coinType == null)
      throw err;
    const address = trim(data);
    if (size(address) === 20)
      return getAddress(address);
    throw err;
  }
}
__name(decodeAddress2, "decodeAddress");

// node_modules/viem/_esm/utils/ens/avatar/utils.js
init_readContract();

// node_modules/viem/_esm/errors/ens.js
init_base();
var EnsAvatarInvalidMetadataError = class extends BaseError2 {
  constructor({ data }) {
    super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
      metaMessages: [
        "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
        "",
        `Provided data: ${JSON.stringify(data)}`
      ],
      name: "EnsAvatarInvalidMetadataError"
    });
  }
};
__name(EnsAvatarInvalidMetadataError, "EnsAvatarInvalidMetadataError");
var EnsAvatarInvalidNftUriError = class extends BaseError2 {
  constructor({ reason }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`, {
      name: "EnsAvatarInvalidNftUriError"
    });
  }
};
__name(EnsAvatarInvalidNftUriError, "EnsAvatarInvalidNftUriError");
var EnsAvatarUriResolutionError = class extends BaseError2 {
  constructor({ uri }) {
    super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
  }
};
__name(EnsAvatarUriResolutionError, "EnsAvatarUriResolutionError");
var EnsAvatarUnsupportedNamespaceError = class extends BaseError2 {
  constructor({ namespace }) {
    super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
  }
};
__name(EnsAvatarUnsupportedNamespaceError, "EnsAvatarUnsupportedNamespaceError");

// node_modules/viem/_esm/utils/ens/avatar/utils.js
init_toHex();
var networkRegex = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
var ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
var base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
var dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
async function isImageUri(uri) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return contentType?.startsWith("image/");
    }
    return false;
  } catch (error) {
    if (typeof error === "object" && typeof error.response !== "undefined") {
      return false;
    }
    if (!Object.hasOwn(globalThis, "Image"))
      return false;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = uri;
    });
  }
}
__name(isImageUri, "isImageUri");
function getGateway(custom, defaultGateway) {
  if (!custom)
    return defaultGateway;
  if (custom.endsWith("/"))
    return custom.slice(0, -1);
  return custom;
}
__name(getGateway, "getGateway");
function resolveAvatarUri({ uri, gatewayUrls }) {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded)
    return { uri, isOnChain: true, isEncoded };
  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
  const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
  const networkRegexMatch = uri.match(networkRegex);
  const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }
  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }
  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false
    };
  }
  throw new EnsAvatarUriResolutionError({ uri });
}
__name(resolveAvatarUri, "resolveAvatarUri");
function getJsonImage(data) {
  if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }
  return data.image || data.image_url || data.image_data;
}
__name(getJsonImage, "getJsonImage");
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
  try {
    const res = await fetch(uri).then((res2) => res2.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res)
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}
__name(getMetadataAvatarUri, "getMetadataAvatarUri");
async function parseAvatarUri({ gatewayUrls, uri }) {
  const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
  if (isOnChain)
    return resolvedURI;
  const isImage = await isImageUri(resolvedURI);
  if (isImage)
    return resolvedURI;
  throw new EnsAvatarUriResolutionError({ uri });
}
__name(parseAvatarUri, "parseAvatarUri");
function parseNftUri(uri_) {
  let uri = uri_;
  if (uri.startsWith("did:nft:")) {
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }
  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");
  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found"
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
  return {
    chainID: Number.parseInt(chainID, 10),
    namespace: erc_namespace.toLowerCase(),
    contractAddress,
    tokenID
  };
}
__name(parseNftUri, "parseNftUri");
async function getNftTokenUri(client, { nft }) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)]
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)]
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
__name(getNftTokenUri, "getNftTokenUri");
function getNftMetadataUri({ nft, uri }) {
  const tokenId = nft.namespace === "erc1155" ? numberToHex(BigInt(nft.tokenID), { size: 32 }).slice(2) : nft.tokenID;
  return uri.replace(/(?:0x)?{id}/, tokenId);
}
__name(getNftMetadataUri, "getNftMetadataUri");

// node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
async function parseAvatarRecord(client, { gatewayUrls, record }) {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record });
  return parseAvatarUri({ uri: record, gatewayUrls });
}
__name(parseAvatarRecord, "parseAvatarRecord");
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
  const nft = parseNftUri(record);
  const nftUri = await getNftTokenUri(client, { nft });
  const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
  if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
    const encodedJson = isEncoded ? (
      // if it is encoded, decode it
      atob(resolvedNftUri.replace("data:application/json;base64,", ""))
    ) : (
      // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
      resolvedNftUri
    );
    const decoded = JSON.parse(encodedJson);
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
  }
  return getMetadataAvatarUri({
    gatewayUrls,
    uri: getNftMetadataUri({ nft, uri: resolvedNftUri })
  });
}
__name(parseNftAvatarUri, "parseNftAvatarUri");

// node_modules/viem/_esm/actions/ens/getEnsAvatar.js
init_getAction();

// node_modules/viem/_esm/actions/ens/getEnsText.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_toHex();
init_localBatchGatewayRequest();
init_getAction();
init_readContract();
async function getEnsText(client, parameters) {
  const { blockNumber, blockTag, key, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: textResolverAbi,
          functionName: "text",
          args: [namehash(name), key]
        }),
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      functionName: "resolveWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const record = decodeFunctionResult({
      abi: textResolverAbi,
      functionName: "text",
      data: res[0]
    });
    return record === "" ? null : record;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsText, "getEnsText");

// node_modules/viem/_esm/actions/ens/getEnsAvatar.js
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
  const record = await getAction(client, getEnsText, "getEnsText")({
    blockNumber,
    blockTag,
    key: "avatar",
    name,
    universalResolverAddress,
    gatewayUrls,
    strict
  });
  if (!record)
    return null;
  try {
    return await parseAvatarRecord(client, {
      record,
      gatewayUrls: assetGatewayUrls
    });
  } catch {
    return null;
  }
}
__name(getEnsAvatar, "getEnsAvatar");

// node_modules/viem/_esm/actions/ens/getEnsName.js
init_abis();
init_getChainContractAddress();
init_localBatchGatewayRequest();
init_getAction();
init_readContract();
async function getEnsName(client, parameters) {
  const { address, blockNumber, blockTag, coinType = 60n, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
      functionName: "reverseWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const [name] = await readContractAction(readContractParameters);
    return name || null;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsName, "getEnsName");

// node_modules/viem/_esm/actions/ens/getEnsResolver.js
init_getChainContractAddress();
init_toHex();
init_getAction();
init_readContract();
async function getEnsResolver(client, parameters) {
  const { blockNumber, blockTag, name } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    throw new Error(`${name} is not a valid ENS TLD (${tlds?.join(", ")}) for chain "${chain.name}" (id: ${chain.id}).`);
  const [resolverAddress] = await getAction(client, readContract, "readContract")({
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: "bytes" }],
        name: "findResolver",
        outputs: [
          { type: "address" },
          { type: "bytes32" },
          { type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "findResolver",
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag
  });
  return resolverAddress;
}
__name(getEnsResolver, "getEnsResolver");

// node_modules/viem/_esm/clients/decorators/public.js
init_call();

// node_modules/viem/_esm/actions/public/createAccessList.js
init_parseAccount();
init_base();
init_toHex();
init_getCallError();
init_extract();
init_transactionRequest();
init_assertRequest();
async function createAccessList(client, args) {
  const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  try {
    assertRequest(args);
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format2 = chainFormat || formatTransactionRequest;
    const request = format2({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to,
      value
    }, "createAccessList");
    const response = await client.request({
      method: "eth_createAccessList",
      params: [request, block]
    });
    if (response.error)
      throw new BaseError2(response.error, { details: response.error });
    return {
      accessList: response.accessList,
      gasUsed: BigInt(response.gasUsed)
    };
  } catch (err) {
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
__name(createAccessList, "createAccessList");

// node_modules/viem/_esm/actions/public/createBlockFilter.js
init_createFilterRequestScope();
async function createBlockFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newBlockFilter"
  });
  const id = await client.request({
    method: "eth_newBlockFilter"
  });
  return { id, request: getRequest(id), type: "block" };
}
__name(createBlockFilter, "createBlockFilter");

// node_modules/viem/_esm/clients/decorators/public.js
init_createContractEventFilter();

// node_modules/viem/_esm/actions/public/createEventFilter.js
init_encodeEventTopics();
init_toHex();
init_createFilterRequestScope();
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
  const events = events_ ?? (event ? [event] : void 0);
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        ...topics.length ? { topics } : {}
      }
    ]
  });
  return {
    abi: events,
    args,
    eventName: event ? event.name : void 0,
    fromBlock,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    toBlock,
    type: "event"
  };
}
__name(createEventFilter, "createEventFilter");

// node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
init_createFilterRequestScope();
async function createPendingTransactionFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newPendingTransactionFilter"
  });
  const id = await client.request({
    method: "eth_newPendingTransactionFilter"
  });
  return { id, request: getRequest(id), type: "transaction" };
}
__name(createPendingTransactionFilter, "createPendingTransactionFilter");

// node_modules/viem/_esm/clients/decorators/public.js
init_estimateContractGas();
init_estimateFeesPerGas();
init_estimateGas2();
init_estimateMaxPriorityFeePerGas();
init_fillTransaction();

// node_modules/viem/_esm/actions/public/getBalance.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_formatBlockParameter();
init_getAction();
init_call();
async function getBalance(client, { address, blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  if (client.batch?.multicall && client.chain?.contracts?.multicall3) {
    const multicall3Address = client.chain.contracts.multicall3.address;
    const calldata = encodeFunctionData({
      abi: multicall3Abi,
      functionName: "getEthBalance",
      args: [address]
    });
    const { data } = await getAction(client, call, "call")({
      to: multicall3Address,
      data: calldata,
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical
    });
    return decodeFunctionResult({
      abi: multicall3Abi,
      functionName: "getEthBalance",
      args: [address],
      data: data || "0x"
    });
  }
  const balance = await client.request({
    method: "eth_getBalance",
    params: [address, block]
  });
  return BigInt(balance);
}
__name(getBalance, "getBalance");

// node_modules/viem/_esm/actions/public/getBlobBaseFee.js
async function getBlobBaseFee(client) {
  const baseFee = await client.request({
    method: "eth_blobBaseFee"
  });
  return BigInt(baseFee);
}
__name(getBlobBaseFee, "getBlobBaseFee");

// node_modules/viem/_esm/clients/decorators/public.js
init_getBlock();
init_getBlockNumber();

// node_modules/viem/_esm/actions/public/getBlockReceipts.js
init_block();
init_toHex();
init_transactionReceipt();
async function getBlockReceipts(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest" } = {}) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  const receipts = await client.request({
    method: "eth_getBlockReceipts",
    params: [blockHash || blockNumberHex || blockTag]
  }, { dedupe: Boolean(blockHash || blockNumberHex) });
  if (!receipts)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format2 = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return receipts.map((receipt) => format2(receipt, "getBlockReceipts"));
}
__name(getBlockReceipts, "getBlockReceipts");

// node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
init_fromHex();
init_toHex();
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let count;
  if (blockHash) {
    count = await client.request({
      method: "eth_getBlockTransactionCountByHash",
      params: [blockHash]
    }, { dedupe: true });
  } else {
    count = await client.request({
      method: "eth_getBlockTransactionCountByNumber",
      params: [blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  return hexToNumber(count);
}
__name(getBlockTransactionCount, "getBlockTransactionCount");

// node_modules/viem/_esm/clients/decorators/public.js
init_getChainId();

// node_modules/viem/_esm/actions/public/getCode.js
init_formatBlockParameter();
async function getCode(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const hex = await client.request({
    method: "eth_getCode",
    params: [address, block]
  }, {
    dedupe: typeof blockNumber === "bigint" || blockHash !== void 0
  });
  if (hex === "0x")
    return void 0;
  return hex;
}
__name(getCode, "getCode");

// node_modules/viem/_esm/clients/decorators/public.js
init_getContractEvents();

// node_modules/viem/_esm/actions/public/getDelegation.js
init_getAddress();
init_size();
init_slice();
async function getDelegation(client, { address, blockNumber, blockTag = "latest" }) {
  const code = await getCode(client, {
    address,
    ...blockNumber !== void 0 ? { blockNumber } : { blockTag }
  });
  if (!code)
    return void 0;
  if (size(code) !== 23)
    return void 0;
  if (!code.startsWith("0xef0100"))
    return void 0;
  return getAddress(slice(code, 3, 23));
}
__name(getDelegation, "getDelegation");

// node_modules/viem/_esm/errors/eip712.js
init_base();
var Eip712DomainNotFoundError = class extends BaseError2 {
  constructor({ address }) {
    super(`No EIP-712 domain found on contract "${address}".`, {
      metaMessages: [
        "Ensure that:",
        `- The contract is deployed at the address "${address}".`,
        "- `eip712Domain()` function exists on the contract.",
        "- `eip712Domain()` function matches signature to ERC-5267 specification."
      ],
      name: "Eip712DomainNotFoundError"
    });
  }
};
__name(Eip712DomainNotFoundError, "Eip712DomainNotFoundError");

// node_modules/viem/_esm/actions/public/getEip712Domain.js
init_getAction();
init_readContract();
async function getEip712Domain(client, parameters) {
  const { address, factory, factoryData } = parameters;
  try {
    const [fields, name, version4, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
      abi,
      address,
      functionName: "eip712Domain",
      factory,
      factoryData
    });
    return {
      domain: {
        name,
        version: version4,
        chainId: Number(chainId),
        verifyingContract,
        salt
      },
      extensions,
      fields
    };
  } catch (e) {
    const error = e;
    if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
      throw new Eip712DomainNotFoundError({ address });
    }
    throw error;
  }
}
__name(getEip712Domain, "getEip712Domain");
var abi = [
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", type: "bytes1" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "extensions", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// node_modules/viem/_esm/actions/public/getFeeHistory.js
init_toHex();

// node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
  };
}
__name(formatFeeHistory, "formatFeeHistory");

// node_modules/viem/_esm/actions/public/getFeeHistory.js
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
  const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
  const feeHistory = await client.request({
    method: "eth_feeHistory",
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles
    ]
  }, { dedupe: Boolean(blockNumberHex) });
  return formatFeeHistory(feeHistory);
}
__name(getFeeHistory, "getFeeHistory");

// node_modules/viem/_esm/clients/decorators/public.js
init_getFilterChanges();

// node_modules/viem/_esm/actions/public/getFilterLogs.js
init_parseEventLogs();
init_log2();
async function getFilterLogs(_client, { filter }) {
  const strict = filter.strict ?? false;
  const logs = await filter.request({
    method: "eth_getFilterLogs",
    params: [filter.id]
  });
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
__name(getFilterLogs, "getFilterLogs");

// node_modules/viem/_esm/clients/decorators/public.js
init_getGasPrice();
init_getLogs();

// node_modules/viem/_esm/actions/public/getProof.js
init_formatBlockParameter();

// node_modules/viem/_esm/utils/formatters/proof.js
init_utils5();
function formatStorageProof(storageProof) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value)
  }));
}
__name(formatStorageProof, "formatStorageProof");
function formatProof(proof) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : void 0,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : void 0,
    storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : void 0
  };
}
__name(formatProof, "formatProof");

// node_modules/viem/_esm/actions/public/getProof.js
async function getProof(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, storageKeys }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const proof = await client.request({
    method: "eth_getProof",
    params: [address, storageKeys, block]
  });
  return formatProof(proof);
}
__name(getProof, "getProof");

// node_modules/viem/_esm/actions/public/getRawTransaction.js
init_transaction();
async function getRawTransaction(client, { hash: hash3 }) {
  const rawTransaction = await client.request({
    method: "eth_getRawTransactionByHash",
    params: [hash3]
  }, { dedupe: true });
  if (!rawTransaction)
    throw new TransactionNotFoundError({ hash: hash3 });
  return rawTransaction;
}
__name(getRawTransaction, "getRawTransaction");

// node_modules/viem/_esm/actions/public/getStorageAt.js
init_formatBlockParameter();
async function getStorageAt(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, slot }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const data = await client.request({
    method: "eth_getStorageAt",
    params: [address, slot, block]
  });
  return data;
}
__name(getStorageAt, "getStorageAt");

// node_modules/viem/_esm/actions/public/getStorageValues.js
init_formatBlockParameter();
async function getStorageValues(client, { blockHash, blockNumber, blockTag = "latest", requireCanonical, requests }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  return client.request({
    method: "eth_getStorageValues",
    params: [requests, block]
  });
}
__name(getStorageValues, "getStorageValues");

// node_modules/viem/_esm/clients/decorators/public.js
init_getTransaction();

// node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
init_getAction();
init_getBlockNumber();
init_getTransaction();
async function getTransactionConfirmations(client, { hash: hash3, transactionReceipt }) {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, "getBlockNumber")({}),
    hash3 ? getAction(client, getTransaction, "getTransaction")({ hash: hash3 }) : void 0
  ]);
  const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
  if (!transactionBlockNumber)
    return 0n;
  return blockNumber - transactionBlockNumber + 1n;
}
__name(getTransactionConfirmations, "getTransactionConfirmations");

// node_modules/viem/_esm/clients/decorators/public.js
init_getTransactionCount();
init_getTransactionReceipt();
init_multicall();
init_readContract();

// node_modules/viem/_esm/actions/public/simulateBlocks.js
init_BlockOverrides();
init_parseAccount();
init_abi();
init_contract();
init_node();
init_decodeFunctionResult();
init_encodeFunctionData();
init_concat();
init_toHex();
init_getContractError();
init_getNodeError();
init_block2();
init_log2();
init_transactionRequest();
init_stateOverride2();
init_assertRequest();
async function simulateBlocks(client, parameters) {
  const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
  try {
    const blockStateCalls = [];
    for (const block2 of blocks) {
      const blockOverrides = block2.blockOverrides ? toRpc2(block2.blockOverrides) : void 0;
      const calls = block2.calls.map((call_) => {
        const call2 = call_;
        const account = call2.account ? parseAccount(call2.account) : void 0;
        const data = call2.abi ? encodeFunctionData(call2) : call2.data;
        const request = {
          ...call2,
          account,
          data: call2.dataSuffix ? concat([data || "0x", call2.dataSuffix]) : data,
          from: call2.from ?? account?.address
        };
        assertRequest(request);
        return formatTransactionRequest(request);
      });
      const stateOverrides = block2.stateOverrides ? serializeStateOverride(block2.stateOverrides) : void 0;
      blockStateCalls.push({
        blockOverrides,
        calls,
        stateOverrides
      });
    }
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const result = await client.request({
      method: "eth_simulateV1",
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block
      ]
    });
    return result.map((block2, i) => ({
      ...formatBlock(block2),
      calls: block2.calls.map((call2, j) => {
        const { abi: abi2, args, functionName, to } = blocks[i].calls[j];
        const data = call2.error?.data ?? call2.returnData;
        const gasUsed = BigInt(call2.gasUsed);
        const maxUsedGas = call2.maxUsedGas === void 0 ? void 0 : BigInt(call2.maxUsedGas);
        const logs = call2.logs?.map((log) => formatLog(log));
        const status = call2.status === "0x1" ? "success" : "failure";
        const result2 = abi2 && status === "success" && data !== "0x" ? decodeFunctionResult({
          abi: abi2,
          data,
          functionName
        }) : null;
        const error = (() => {
          if (status === "success")
            return void 0;
          let error2;
          if (data === "0x")
            error2 = new AbiDecodingZeroDataError();
          else if (data)
            error2 = new RawContractError({ data });
          if (!error2)
            return void 0;
          return getContractError(error2, {
            abi: abi2 ?? [],
            address: to ?? "0x",
            args,
            functionName: functionName ?? "<unknown>"
          });
        })();
        return {
          data,
          gasUsed,
          logs,
          // only present when reported by the node, so existing consumers
          // (and snapshots) are unaffected on nodes that omit it.
          ...maxUsedGas === void 0 ? {} : { maxUsedGas },
          status,
          ...status === "success" ? {
            result: result2
          } : {
            error
          }
        };
      })
    }));
  } catch (e) {
    const cause = e;
    const error = getNodeError(cause, {});
    if (error instanceof UnknownNodeError)
      throw cause;
    throw error;
  }
}
__name(simulateBlocks, "simulateBlocks");

// node_modules/ox/_esm/core/AbiConstructor.js
init_AbiItem();
init_AbiParameters();
init_Hex();
function encode3(...parameters) {
  const [abiConstructor, options] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, options2] = parameters;
      return [fromAbi2(abi2), options2];
    }
    return parameters;
  })();
  const { bytecode, args } = options;
  return concat2(bytecode, abiConstructor.inputs?.length && args?.length ? encode2(abiConstructor.inputs, args) : "0x");
}
__name(encode3, "encode");
function from12(abiConstructor) {
  return from11(abiConstructor);
}
__name(from12, "from");
function fromAbi2(abi2) {
  const item = abi2.find((item2) => item2.type === "constructor");
  if (!item)
    throw new NotFoundError({ name: "constructor" });
  return item;
}
__name(fromAbi2, "fromAbi");

// node_modules/viem/_esm/actions/public/simulateCalls.js
init_AbiEvent();

// node_modules/ox/_esm/core/AbiFunction.js
init_AbiItem();
init_AbiParameters();
init_Hex();
function decodeResult(...parameters) {
  const [abiFunction, data, options = {}] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name, data2, options2] = parameters;
      return [fromAbi3(abi2, name), data2, options2];
    }
    return parameters;
  })();
  const values = decode(abiFunction.outputs, data, options);
  if (values && Object.keys(values).length === 0)
    return void 0;
  if (values && Object.keys(values).length === 1) {
    if (Array.isArray(values))
      return values[0];
    return Object.values(values)[0];
  }
  return values;
}
__name(decodeResult, "decodeResult");
function encodeData2(...parameters) {
  const [abiFunction, args = []] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name, args3] = parameters;
      return [fromAbi3(abi2, name, { args: args3 }), args3];
    }
    const [abiFunction2, args2] = parameters;
    return [abiFunction2, args2];
  })();
  const { overloads } = abiFunction;
  const item = overloads ? fromAbi3([abiFunction, ...overloads], abiFunction.name, {
    args
  }) : abiFunction;
  const selector = getSelector3(item);
  const data = args.length > 0 ? encode2(item.inputs, args) : void 0;
  return data ? concat2(selector, data) : selector;
}
__name(encodeData2, "encodeData");
function from14(abiFunction, options = {}) {
  return from11(abiFunction, options);
}
__name(from14, "from");
function fromAbi3(abi2, name, options) {
  const item = fromAbi(abi2, name, options);
  if (item.type !== "function")
    throw new NotFoundError({ name, type: "function" });
  return item;
}
__name(fromAbi3, "fromAbi");
function getSelector3(abiItem) {
  return getSelector(abiItem);
}
__name(getSelector3, "getSelector");

// node_modules/viem/_esm/actions/public/simulateCalls.js
init_parseAccount();
init_address2();
init_contracts();
init_base();
init_contract();
init_node();
init_pad();
init_fromHex();
init_call();
init_getBlock();
init_getBlockNumber();
var getBalanceCode = "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
var staticCallCode = "0x608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063fd00430c1461002d575b5f5ffd5b6100476004803603810190610042919061012b565b610049565b005b80825f375f5f825f865afa610060573d5f5f3e3d5ffd5b3d5f5f3e3d5ff35b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009982610070565b9050919050565b6100a98161008f565b81146100b3575f5ffd5b50565b5f813590506100c4816100a0565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f8401126100eb576100ea6100ca565b5b8235905067ffffffffffffffff811115610108576101076100ce565b5b602083019150836001820283011115610124576101236100d2565b5b9250929050565b5f5f5f6040848603121561014257610141610068565b5b5f61014f868287016100b6565b935050602084013567ffffffffffffffff8111156101705761016f61006c565b5b61017c868287016100d6565b9250925050925092509256fea2646970667358221220635ed99185cacf3f2acba6921f23687c969cec2bbaf5f9ad599f507e6e105e6964736f6c63430008230033";
var assetProbeGas = 1000000n;
var staticCallAddressBase = 0x00000000000000000000000000000000deadbeefn;
var transferEventSelector = getSelector2(from13("event Transfer(address indexed from, address indexed to, uint256 value)"));
var balanceOfFunction = from14("function balanceOf(address) returns (uint256)");
var decimalsFunction = from14("function decimals() returns (uint256)");
var tokenUriFunction = from14("function tokenURI(uint256) returns (string)");
var symbolFunction = from14("function symbol() returns (string)");
var staticCallFunction = from14("function query(address target, bytes data)");
async function simulateCalls(client, parameters) {
  const { blockNumber, blockTag, calls, stateOverrides, traceAssetChanges, traceTransfers, validation } = parameters;
  const account = parameters.account ? parseAccount(parameters.account) : void 0;
  if (traceAssetChanges && !account)
    throw new BaseError2("`account` is required when `traceAssetChanges` is true");
  const getBalanceData = account ? encode3(from12("constructor(bytes, bytes)"), {
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [
      getBalanceCode,
      encodeData2(from14("function getBalance(address)"), [account.address])
    ]
  }) : void 0;
  const blockTag_ = blockTag ?? client.experimental_blockTag ?? "latest";
  let baseBlockNumber = blockNumber;
  if (traceAssetChanges && typeof baseBlockNumber !== "bigint" && blockTag_ !== "earliest" && blockTag_ !== "pending") {
    if (blockTag_ === "latest")
      baseBlockNumber = await getBlockNumber(client, { cacheTime: 0 });
    else {
      const block2 = await getBlock(client, { blockTag: blockTag_ });
      if (typeof block2.number !== "bigint")
        throw new BaseError2(`Block tag \`${blockTag_}\` did not resolve to a number.`);
      baseBlockNumber = block2.number;
    }
  }
  const block_ = typeof baseBlockNumber === "bigint" ? { blockNumber: baseBlockNumber } : { blockTag: blockTag_ };
  const discovery = traceAssetChanges ? await simulateBlocks(client, {
    ...block_,
    blocks: [
      {
        calls: calls.map((call2) => ({
          ...call2,
          from: account.address
        })),
        stateOverrides
      }
    ],
    traceTransfers,
    validation
  }) : void 0;
  const assetAddresses = discovery ? [
    .../* @__PURE__ */ new Set([
      ...tokensFromLogs(discovery[0].calls.flatMap((call2) => call2.logs ?? []), account.address),
      // Included even for calls without data: contracts that mint on receiving
      // native value (WETH) emit `Deposit`, not a `Transfer` the logs would catch.
      // Candidates without code fall out at `isBalance`.
      ...parameters.calls.map((call2) => call2.to?.toLowerCase())
    ])
  ].filter((address) => Boolean(address) && address !== ethAddress && address !== zeroAddress) : [];
  const staticCallAddress = getStaticCallAddress([
    ...account ? [account.address] : [],
    ...assetAddresses,
    ...stateOverrides?.map(({ address }) => address) ?? []
  ]);
  const staticCallStateOverrides = [
    { address: staticCallAddress, code: staticCallCode }
  ];
  const [balanceCallsPre, blocks] = await Promise.all([
    traceAssetChanges ? Promise.all([
      readBalance(client, {
        account: account.address,
        ...block_,
        data: getBalanceData,
        stateOverride: stateOverrides
      }),
      ...assetAddresses.map((address) => readBalance(client, {
        account: account.address,
        address,
        ...block_,
        data: encodeData2(balanceOfFunction, [
          account.address
        ]),
        staticCallAddress,
        stateOverride: stateOverrides
      }))
    ]) : [],
    simulateBlocks(client, {
      ...block_,
      blocks: [
        {
          calls: [...calls, { to: zeroAddress }].map((call2) => ({
            ...call2,
            from: account?.address
          })),
          stateOverrides
        },
        ...traceAssetChanges ? [
          // ETH post balances
          {
            calls: [{ data: getBalanceData }]
          },
          // Asset post balances
          {
            calls: assetAddresses.map((address) => ({
              to: staticCallAddress,
              gas: assetProbeGas,
              data: encodeStaticCall(address, encodeData2(balanceOfFunction, [
                account.address
              ]))
            })),
            stateOverrides: staticCallStateOverrides
          },
          // Decimals
          {
            calls: assetAddresses.map((address) => ({
              to: staticCallAddress,
              gas: assetProbeGas,
              data: encodeStaticCall(address, encodeData2(decimalsFunction))
            })),
            stateOverrides: staticCallStateOverrides
          },
          // Token URI
          {
            calls: assetAddresses.map((address) => ({
              to: staticCallAddress,
              gas: assetProbeGas,
              data: encodeStaticCall(address, encodeData2(tokenUriFunction, [0n]))
            })),
            stateOverrides: staticCallStateOverrides
          },
          // Symbols
          {
            calls: assetAddresses.map((address) => ({
              to: staticCallAddress,
              gas: assetProbeGas,
              data: encodeStaticCall(address, encodeData2(symbolFunction))
            })),
            stateOverrides: staticCallStateOverrides
          }
        ] : []
      ],
      traceTransfers,
      validation
    })
  ]);
  const block_results = blocks[0];
  const [block_ethPost, block_assetsPost, block_decimals, block_tokenURI, block_symbols] = traceAssetChanges ? blocks.slice(1) : [];
  const { calls: block_calls, ...block } = block_results;
  const results = block_calls.slice(0, -1);
  const balancesPre = balanceCallsPre.map((call2) => isBalance(call2) ? hexToBigInt(call2.data) : null);
  const ethPost = block_ethPost?.calls ?? [];
  const assetsPost = block_assetsPost?.calls ?? [];
  const balanceCallsPost = [...ethPost, ...assetsPost];
  const balancesPost = balanceCallsPost.map((call2) => isBalance(call2) ? hexToBigInt(call2.data) : null);
  const decimals = (block_decimals?.calls ?? []).map((call2) => decodeAssetResult(call2, decimalsFunction));
  const symbols = (block_symbols?.calls ?? []).map((call2) => decodeAssetResult(call2, symbolFunction));
  const tokenURI = (block_tokenURI?.calls ?? []).map((call2) => decodeAssetResult(call2, tokenUriFunction));
  const changes = [];
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre_ = balancesPre[i];
    const preCall = balanceCallsPre[i];
    const balancePre = typeof balancePre_ === "bigint" ? balancePre_ : i > 0 && preCall?.status === "success" && preCall.data === "0x" ? 0n : null;
    if (typeof balancePost !== "bigint")
      continue;
    if (typeof balancePre !== "bigint")
      continue;
    const decimals_ = decimals[i - 1];
    const symbol_ = symbols[i - 1];
    const tokenURI_ = tokenURI[i - 1];
    const token = (() => {
      if (i === 0)
        return {
          address: ethAddress,
          decimals: 18,
          symbol: "ETH"
        };
      return {
        address: assetAddresses[i - 1],
        decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : void 0,
        symbol: symbol_ ?? void 0
      };
    })();
    changes.push({
      token,
      value: {
        pre: balancePre,
        post: balancePost,
        diff: balancePost - balancePre
      }
    });
  }
  return {
    assetChanges: changes,
    block,
    results
  };
}
__name(simulateCalls, "simulateCalls");
function encodeStaticCall(address, data) {
  return encodeData2(staticCallFunction, [address, data]);
}
__name(encodeStaticCall, "encodeStaticCall");
function tokensFromLogs(logs, account) {
  const account_ = pad(account.toLowerCase(), { size: 32 });
  return logs.filter((log) => {
    if (log.topics[0]?.toLowerCase() !== transferEventSelector)
      return false;
    if (log.address.toLowerCase() === ethAddress)
      return false;
    return log.topics[1]?.toLowerCase() === account_ || log.topics[2]?.toLowerCase() === account_;
  }).map((log) => log.address.toLowerCase());
}
__name(tokensFromLogs, "tokensFromLogs");
function isBalance(call2) {
  return call2.status === "success" && /^0x[\da-f]{64}$/i.test(call2.data);
}
__name(isBalance, "isBalance");
function decodeAssetResult(call2, abiFunction) {
  if (call2.status === "failure" || call2.data === "0x")
    return null;
  try {
    return decodeResult(abiFunction, call2.data);
  } catch {
    return null;
  }
}
__name(decodeAssetResult, "decodeAssetResult");
async function readBalance(client, parameters) {
  const { account, address, blockNumber, blockTag, data, staticCallAddress, stateOverride } = parameters;
  try {
    const result = await call({ ...client, ccipRead: false }, {
      account: address ? zeroAddress : account,
      data: address ? encodeStaticCall(address, data) : data,
      stateOverride: address && staticCallAddress ? [
        ...stateOverride ?? [],
        { address: staticCallAddress, code: staticCallCode }
      ] : stateOverride,
      ...address ? { gas: assetProbeGas, to: staticCallAddress } : {},
      ...typeof blockNumber === "bigint" ? { blockNumber } : { blockTag }
    });
    return { data: result.data ?? "0x", status: "success" };
  } catch (error) {
    if (!(error instanceof CallExecutionError) || !(error.cause instanceof ExecutionRevertedError))
      throw error;
    return { data: "0x", status: "failure" };
  }
}
__name(readBalance, "readBalance");
function getStaticCallAddress(addresses) {
  const occupied = new Set(addresses.map((address) => address.toLowerCase()));
  let value = staticCallAddressBase;
  while (occupied.has(`0x${value.toString(16).padStart(40, "0")}`))
    value++;
  return `0x${value.toString(16).padStart(40, "0")}`;
}
__name(getStaticCallAddress, "getStaticCallAddress");

// node_modules/viem/_esm/clients/decorators/public.js
init_simulateContract();
init_uninstallFilter();

// node_modules/ox/_esm/erc6492/SignatureErc6492.js
var SignatureErc6492_exports = {};
__export(SignatureErc6492_exports, {
  InvalidWrappedSignatureError: () => InvalidWrappedSignatureError2,
  assert: () => assert7,
  from: () => from15,
  magicBytes: () => magicBytes2,
  universalSignatureValidatorAbi: () => universalSignatureValidatorAbi,
  universalSignatureValidatorBytecode: () => universalSignatureValidatorBytecode,
  unwrap: () => unwrap2,
  validate: () => validate5,
  wrap: () => wrap2
});
init_AbiParameters();
init_Errors();
init_Hex();
var magicBytes2 = "0x6492649264926492649264926492649264926492649264926492649264926492";
var universalSignatureValidatorBytecode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
var universalSignatureValidatorAbi = [
  {
    inputs: [
      {
        name: "_signer",
        type: "address"
      },
      {
        name: "_hash",
        type: "bytes32"
      },
      {
        name: "_signature",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        name: "_signer",
        type: "address"
      },
      {
        name: "_hash",
        type: "bytes32"
      },
      {
        name: "_signature",
        type: "bytes"
      }
    ],
    outputs: [
      {
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "isValidSig"
  }
];
function assert7(wrapped) {
  if (slice3(wrapped, -32) !== magicBytes2)
    throw new InvalidWrappedSignatureError2(wrapped);
}
__name(assert7, "assert");
function from15(wrapped) {
  if (typeof wrapped === "string")
    return unwrap2(wrapped);
  return wrapped;
}
__name(from15, "from");
function unwrap2(wrapped) {
  assert7(wrapped);
  const [to, data, signature] = decode(from6("address, bytes, bytes"), wrapped);
  return { data, signature, to };
}
__name(unwrap2, "unwrap");
function wrap2(value) {
  const { data, signature, to } = value;
  return concat2(encode2(from6("address, bytes, bytes"), [
    to,
    data,
    signature
  ]), magicBytes2);
}
__name(wrap2, "wrap");
function validate5(wrapped) {
  try {
    assert7(wrapped);
    return true;
  } catch {
    return false;
  }
}
__name(validate5, "validate");
var InvalidWrappedSignatureError2 = class extends BaseError3 {
  constructor(wrapped) {
    super(`Value \`${wrapped}\` is an invalid ERC-6492 wrapped signature.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureErc6492.InvalidWrappedSignatureError"
    });
  }
};
__name(InvalidWrappedSignatureError2, "InvalidWrappedSignatureError");

// node_modules/viem/_esm/actions/public/verifyHash.js
init_erc8010();
init_abis();
init_contracts();
init_contract();
init_encodeDeployData();
init_encodeFunctionData();
init_getAddress();
init_isAddressEqual();
init_verifyAuthorization();
init_concat();
init_isHex();
init_fromHex();
init_toHex();
init_getAction();
init_recoverAddress();

// node_modules/viem/_esm/utils/signature/serializeSignature.js
init_secp256k1();
init_fromHex();
init_toBytes();
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}
__name(serializeSignature, "serializeSignature");

// node_modules/viem/_esm/actions/public/verifyHash.js
init_call();
init_readContract();
async function verifyHash(client, parameters) {
  const { address, chain = client.chain, hash: hash3, erc6492VerifierAddress: verifierAddress = parameters.universalSignatureVerifierAddress ?? chain?.contracts?.erc6492Verifier?.address, multicallAddress = parameters.multicallAddress ?? chain?.contracts?.multicall3?.address, mode = "auto" } = parameters;
  if (chain?.verifyHash)
    return await chain.verifyHash(client, parameters);
  const signature = (() => {
    const signature2 = parameters.signature;
    if (isHex(signature2))
      return signature2;
    if (typeof signature2 === "object" && "r" in signature2 && "s" in signature2)
      return serializeSignature(signature2);
    return bytesToHex(signature2);
  })();
  try {
    if (mode === "eoa") {
      try {
        const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
        if (verified)
          return true;
      } catch {
      }
    }
    if (SignatureErc8010_exports.validate(signature))
      return await verifyErc8010(client, {
        ...parameters,
        multicallAddress,
        signature
      });
    return await verifyErc6492(client, {
      ...parameters,
      verifierAddress,
      signature
    });
  } catch (error) {
    if (mode !== "eoa") {
      try {
        const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
        if (verified)
          return true;
      } catch {
      }
    }
    if (error instanceof VerificationError) {
      return false;
    }
    throw error;
  }
}
__name(verifyHash, "verifyHash");
async function verifyErc8010(client, parameters) {
  const { address, blockHash, blockNumber, blockTag, hash: hash3, multicallAddress, requireCanonical } = parameters;
  const { authorization: authorization_ox, data: initData, signature, to } = SignatureErc8010_exports.unwrap(parameters.signature);
  const code = await getCode(client, {
    address,
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  if (code === concatHex(["0xef0100", authorization_ox.address]))
    return await verifyErc1271(client, {
      ...parameters,
      signature
    });
  const authorization = {
    address: authorization_ox.address,
    chainId: Number(authorization_ox.chainId),
    nonce: Number(authorization_ox.nonce),
    r: numberToHex(authorization_ox.r, { size: 32 }),
    s: numberToHex(authorization_ox.s, { size: 32 }),
    yParity: authorization_ox.yParity
  };
  const valid = await verifyAuthorization({
    address,
    authorization
  });
  if (!valid)
    throw new VerificationError();
  const results = await getAction(client, readContract, "readContract")({
    ...multicallAddress ? { address: multicallAddress } : { code: multicall3Bytecode },
    authorizationList: [authorization],
    abi: multicall3Abi,
    blockHash,
    blockNumber,
    blockTag: "pending",
    functionName: "aggregate3",
    requireCanonical,
    args: [
      [
        ...initData ? [
          {
            allowFailure: true,
            target: to ?? address,
            callData: initData
          }
        ] : [],
        {
          allowFailure: true,
          target: address,
          callData: encodeFunctionData({
            abi: erc1271Abi,
            functionName: "isValidSignature",
            args: [hash3, signature]
          })
        }
      ]
    ]
  });
  const data = results[results.length - 1]?.returnData;
  if (data?.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError();
}
__name(verifyErc8010, "verifyErc8010");
async function verifyErc6492(client, parameters) {
  const { address, factory, factoryData, hash: hash3, signature, verifierAddress, ...rest } = parameters;
  const wrappedSignature = await (async () => {
    if (!factory && !factoryData)
      return signature;
    if (SignatureErc6492_exports.validate(signature))
      return signature;
    return SignatureErc6492_exports.wrap({
      data: factoryData,
      signature,
      to: factory
    });
  })();
  const args = verifierAddress ? {
    to: verifierAddress,
    data: encodeFunctionData({
      abi: erc6492SignatureValidatorAbi,
      functionName: "isValidSig",
      args: [address, hash3, wrappedSignature]
    }),
    ...rest
  } : {
    data: encodeDeployData({
      abi: erc6492SignatureValidatorAbi,
      args: [address, hash3, wrappedSignature],
      bytecode: erc6492SignatureValidatorByteCode
    }),
    ...rest
  };
  const { data } = await getAction(client, call, "call")(args).catch((error) => {
    if (error instanceof CallExecutionError)
      throw new VerificationError();
    throw error;
  });
  if (hexToBool(data ?? "0x0"))
    return true;
  throw new VerificationError();
}
__name(verifyErc6492, "verifyErc6492");
async function verifyErc1271(client, parameters) {
  const { address, blockHash, blockNumber, blockTag, hash: hash3, requireCanonical, signature } = parameters;
  const result = await getAction(client, readContract, "readContract")({
    address,
    abi: erc1271Abi,
    args: [hash3, signature],
    blockHash,
    blockNumber,
    blockTag,
    functionName: "isValidSignature",
    requireCanonical
  }).catch((error) => {
    if (error instanceof ContractFunctionExecutionError)
      throw new VerificationError();
    throw error;
  });
  if (result.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError();
}
__name(verifyErc1271, "verifyErc1271");
var VerificationError = class extends Error {
};
__name(VerificationError, "VerificationError");

// node_modules/viem/_esm/actions/public/verifyMessage.js
init_getAction();
init_hashMessage();
async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
  const hash3 = hashMessage(message);
  return getAction(client, verifyHash, "verifyHash")({
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifyMessage, "verifyMessage");

// node_modules/viem/_esm/actions/public/verifyTypedData.js
init_getAction();
init_hashTypedData();
async function verifyTypedData(client, parameters) {
  const { address, factory, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
  const hash3 = hashTypedData({ message, primaryType, types, domain });
  return getAction(client, verifyHash, "verifyHash")({
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifyTypedData, "verifyTypedData");

// node_modules/viem/_esm/clients/decorators/public.js
init_waitForTransactionReceipt();

// node_modules/viem/_esm/actions/public/watchBlockHeaders.js
init_block2();
init_observe();
init_stringify();
var blockFields = [
  "size",
  "totalDifficulty",
  "transactions",
  "uncles",
  "withdrawals"
];
function watchBlockHeaders(client, { onBlockHeader, onError }) {
  let prevBlockHeader;
  const observerId = stringify(["watchBlockHeaders", client.uid]);
  return observe(observerId, { onBlockHeader, onError }, (emit) => {
    let active = true;
    let subscribed = false;
    let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          onData(data) {
            if (!active)
              return;
            const blockHeader = (client.chain?.formatters?.block?.format || formatBlock)(data.result, "watchBlockHeaders");
            for (const field of blockFields)
              delete blockHeader[field];
            emit.onBlockHeader(blockHeader, prevBlockHeader);
            prevBlockHeader = blockHeader;
          },
          onError(error) {
            if (subscribed)
              emit.onError?.(error);
          }
        });
        subscribed = true;
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        emit.onError?.(err);
      }
    })();
    return () => unsubscribe();
  });
}
__name(watchBlockHeaders, "watchBlockHeaders");

// node_modules/viem/_esm/clients/decorators/public.js
init_watchBlockNumber();

// node_modules/viem/_esm/actions/public/watchBlocks.js
init_getAction();
init_observe();
init_poll();
init_stringify();
init_getBlock();
function watchBlocks(client, { blockTag = client.experimental_blockTag ?? "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const includeTransactions = includeTransactions_ ?? false;
  let prevBlock;
  const pollBlocks = /* @__PURE__ */ __name(() => {
    const observerId = stringify([
      "watchBlocks",
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval
    ]);
    return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
      try {
        const block = await getAction(client, getBlock, "getBlock")({
          blockTag,
          includeTransactions
        });
        if (block.number !== null && prevBlock?.number != null) {
          if (block.number === prevBlock.number)
            return;
          if (block.number - prevBlock.number > 1 && emitMissed) {
            for (let i = prevBlock?.number + 1n; i < block.number; i++) {
              const block2 = await getAction(client, getBlock, "getBlock")({
                blockNumber: i,
                includeTransactions
              });
              emit.onBlock(block2, prevBlock);
              prevBlock = block2;
            }
          }
        }
        if (
          // If no previous block exists, emit.
          prevBlock?.number == null || // If the block tag is "pending" with no block number, emit.
          blockTag === "pending" && block?.number == null || // If the next block number is greater than the previous block number, emit.
          // We don't want to emit blocks in the past.
          block.number !== null && block.number > prevBlock.number
        ) {
          emit.onBlock(block, prevBlock);
          prevBlock = block;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  }, "pollBlocks");
  const subscribeBlocks = /* @__PURE__ */ __name(() => {
    let active = true;
    let emitFetched = true;
    let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
    (async () => {
      try {
        if (emitOnBegin) {
          getAction(client, getBlock, "getBlock")({
            blockTag,
            includeTransactions
          }).then((block) => {
            if (!active)
              return;
            if (!emitFetched)
              return;
            onBlock(block, void 0);
            emitFetched = false;
          }).catch(onError);
        }
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          async onData(data) {
            if (!active)
              return;
            const block = await getAction(client, getBlock, "getBlock")({
              blockNumber: data.result?.number,
              includeTransactions
            }).catch(() => {
            });
            if (!active)
              return;
            onBlock(block, prevBlock);
            emitFetched = false;
            prevBlock = block;
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribeBlocks");
  return enablePolling ? pollBlocks() : subscribeBlocks();
}
__name(watchBlocks, "watchBlocks");

// node_modules/viem/_esm/clients/decorators/public.js
init_watchContractEvent();

// node_modules/viem/_esm/actions/public/watchEvent.js
init_abi();
init_rpc();
init_decodeEventLog();
init_encodeEventTopics();
init_log2();
init_getAction();
init_observe();
init_poll();
init_stringify();
init_getBlockNumber();
init_getFilterChanges();
init_getLogs();
init_uninstallFilter();
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const strict = strict_ ?? false;
  const pollEvent = /* @__PURE__ */ __name(() => {
    const observerId = stringify([
      "watchEvent",
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createEventFilter, "createEventFilter")({
              address,
              args,
              event,
              events,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getAction(client, getLogs, "getLogs")({
                address,
                args,
                event,
                events,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollEvent");
  const subscribeEvent = /* @__PURE__ */ __name(() => {
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const events_ = events ?? (event ? [event] : void 0);
        let topics = [];
        if (events_) {
          const encoded = events_.flatMap((event2) => encodeEventTopics({
            abi: [event2],
            eventName: event2.name,
            args
          }));
          topics = [encoded];
          if (event)
            topics = topics[0];
        }
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["logs", { address, topics }],
          onData(data) {
            if (!active)
              return;
            const log = data.result;
            try {
              const { eventName, args: args2 } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict
              });
              const formatted = formatLog(log, { args: args2, eventName });
              onLogs([formatted]);
            } catch (err) {
              let eventName;
              let isUnnamed;
              if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                if (strict_)
                  return;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
              }
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName
              });
              onLogs([formatted]);
            }
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribeEvent");
  return enablePolling ? pollEvent() : subscribeEvent();
}
__name(watchEvent, "watchEvent");

// node_modules/viem/_esm/actions/public/watchPendingTransactions.js
init_getAction();
init_observe();
init_poll();
init_stringify();
init_getFilterChanges();
init_uninstallFilter();
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket" && client.transport.type !== "ipc";
  const pollPendingTransactions = /* @__PURE__ */ __name(() => {
    const observerId = stringify([
      "watchPendingTransactions",
      client.uid,
      batch,
      pollingInterval
    ]);
    return observe(observerId, { onTransactions, onError }, (emit) => {
      let filter;
      const unwatch = poll(async () => {
        try {
          if (!filter) {
            try {
              filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
              return;
            } catch (err) {
              unwatch();
              throw err;
            }
          }
          const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          if (hashes.length === 0)
            return;
          if (batch)
            emit.onTransactions(hashes);
          else
            for (const hash3 of hashes)
              emit.onTransactions([hash3]);
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollPendingTransactions");
  const subscribePendingTransactions = /* @__PURE__ */ __name(() => {
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name(() => active = false, "unsubscribe");
    (async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ["newPendingTransactions"],
          onData(data) {
            if (!active)
              return;
            const transaction = data.result;
            onTransactions([transaction]);
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribePendingTransactions");
  return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}
__name(watchPendingTransactions, "watchPendingTransactions");

// node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
init_hashMessage();

// node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
var siweDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function isValidSiweDateTime(value) {
  if (!siweDateTimeRegex.test(value))
    return false;
  return !Number.isNaN(new Date(value).getTime());
}
__name(isValidSiweDateTime, "isValidSiweDateTime");
function parseSiweDateTime(value) {
  if (!isValidSiweDateTime(value))
    return new Date(Number.NaN);
  return new Date(value);
}
__name(parseSiweDateTime, "parseSiweDateTime");
function parseSiweMessage(message) {
  const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
  const { chainId, expirationTime, issuedAt, notBefore, requestId, resources: resources_, ...suffix } = message.match(suffixRegex)?.groups ?? {};
  const resources = resources_?.split("\n- ").slice(1);
  return {
    ...prefix,
    ...suffix,
    ...chainId ? { chainId: Number(chainId) } : {},
    ...expirationTime ? { expirationTime: parseSiweDateTime(expirationTime) } : {},
    ...issuedAt ? { issuedAt: parseSiweDateTime(issuedAt) } : {},
    ...notBefore ? { notBefore: parseSiweDateTime(notBefore) } : {},
    ...requestId ? { requestId } : {},
    ...resources ? { resources } : {},
    ...scheme ? { scheme } : {},
    ...statement ? { statement } : {}
  };
}
__name(parseSiweMessage, "parseSiweMessage");
var prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+\-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
var suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.*))?(?:\nResources:(?<resources>(?:\n- .+)*))?/;

// node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
init_isAddress();
init_isAddressEqual();
function validateSiweMessage(parameters) {
  const { address, domain, message, nonce, scheme, time = /* @__PURE__ */ new Date() } = parameters;
  if (domain && message.domain !== domain)
    return false;
  if (nonce && message.nonce !== nonce)
    return false;
  if (scheme && message.scheme !== scheme)
    return false;
  if (Number.isNaN(time.getTime()))
    return false;
  if (message.expirationTime) {
    if (Number.isNaN(message.expirationTime.getTime()))
      return false;
    if (time >= message.expirationTime)
      return false;
  }
  if (message.notBefore) {
    if (Number.isNaN(message.notBefore.getTime()))
      return false;
    if (time < message.notBefore)
      return false;
  }
  try {
    if (!message.address)
      return false;
    if (!isAddress(message.address, { strict: false }))
      return false;
    if (address && !isAddressEqual(message.address, address))
      return false;
  } catch {
    return false;
  }
  return true;
}
__name(validateSiweMessage, "validateSiweMessage");

// node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
async function verifySiweMessage(client, parameters) {
  const { address, domain, message, nonce, scheme, signature, time = /* @__PURE__ */ new Date(), ...callRequest } = parameters;
  const parsed = parseSiweMessage(message);
  if (!parsed.address)
    return false;
  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time
  });
  if (!isValid)
    return false;
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifySiweMessage, "verifySiweMessage");

// node_modules/viem/_esm/actions/token/approve.js
init_abis();
init_parseEventLogs();
init_estimateContractGas();
init_simulateContract();
init_writeContract();
init_internal();
async function approve(client, parameters) {
  return approve.inner(writeContract, client, parameters);
}
__name(approve, "approve");
(function(approve2) {
  async function inner(action, client, parameters) {
    return await action(client, {
      ...parameters,
      ...approve2.call(client, parameters)
    });
  }
  __name(inner, "inner");
  approve2.inner = inner;
  function call2(client, parameters) {
    return defineCall(getCall(client, parameters));
  }
  __name(call2, "call");
  approve2.call = call2;
  async function estimateGas2(client, parameters) {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters),
      ...approve2.call(client, parameters)
    });
  }
  __name(estimateGas2, "estimateGas");
  approve2.estimateGas = estimateGas2;
  async function simulate(client, parameters) {
    return simulateContract(client, {
      ...pickWriteParameters(parameters),
      ...approve2.call(client, parameters)
    });
  }
  __name(simulate, "simulate");
  approve2.simulate = simulate;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: "Approval",
      strict: true
    });
    if (!log)
      throw new Error("`Approval` event not found.");
    return log;
  }
  __name(extractEvent, "extractEvent");
  approve2.extractEvent = extractEvent;
})(approve || (approve = {}));
function getCall(client, parameters) {
  const { amount, spender, token } = parameters;
  const { address, decimals } = resolveToken(client, { token });
  return {
    abi: erc20Abi,
    address,
    args: [spender, toBaseUnits(amount, decimals)],
    functionName: "approve"
  };
}
__name(getCall, "getCall");

// node_modules/viem/_esm/actions/token/approveSync.js
init_formatUnits();
init_writeContractSync();
init_internal();
async function approveSync(client, parameters) {
  const { amount, token, throwOnReceiptRevert = true } = parameters;
  const { decimals } = resolveToken(client, { token });
  const resolved = resolveAmountDecimals(amount, decimals);
  const receipt = await approve.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert
  });
  const { args } = approve.extractEvent(receipt.logs);
  return {
    ...args,
    ...resolved === void 0 ? {} : { decimals: resolved, formatted: formatUnits(args.value, resolved) },
    receipt
  };
}
__name(approveSync, "approveSync");

// node_modules/viem/_esm/actions/token/getAllowance.js
init_abis();
init_readContract();
init_internal();
async function getAllowance(client, parameters) {
  const { account, decimals, spender, token, ...rest } = parameters;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getAllowance, "getAllowance");
(function(getAllowance2) {
  function call2(client, args) {
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [args.account, args.spender]
    });
  }
  __name(call2, "call");
  getAllowance2.call = call2;
})(getAllowance || (getAllowance = {}));

// node_modules/viem/_esm/actions/token/getBalance.js
init_parseAccount();
init_abis();
init_account();
init_readContract();
init_internal();
async function getBalance2(client, parameters) {
  const { account: account_ = client.account, decimals, token, ...rest } = parameters;
  if (!account_)
    throw new AccountNotFoundError();
  const account = parseAccount(account_).address;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getBalance2.call(client, { account, token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getBalance2, "getBalance");
(function(getBalance3) {
  function call2(client, args) {
    const account_ = args.account ?? client.account;
    if (!account_)
      throw new AccountNotFoundError();
    const account = parseAccount(account_).address;
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account]
    });
  }
  __name(call2, "call");
  getBalance3.call = call2;
})(getBalance2 || (getBalance2 = {}));

// node_modules/viem/_esm/actions/token/getMetadata.js
init_abis();
init_readContract();
init_internal();
async function getMetadata(client, parameters) {
  const { token, ...rest } = parameters;
  const { address } = resolveToken(client, { token });
  const declared = findDeclaredToken(client, token);
  const [decimals_, name, symbol] = await Promise.all([
    declared?.decimals ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "decimals"
    }),
    declared?.name ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "name"
    }),
    declared?.symbol ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "symbol"
    })
  ]);
  return {
    decimals: decimals_,
    name,
    symbol
  };
}
__name(getMetadata, "getMetadata");

// node_modules/viem/_esm/actions/token/getTotalSupply.js
init_abis();
init_readContract();
init_internal();
async function getTotalSupply(client, parameters) {
  const { decimals, token, ...rest } = parameters;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getTotalSupply.call(client, { token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getTotalSupply, "getTotalSupply");
(function(getTotalSupply2) {
  function call2(client, args) {
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      args: [],
      functionName: "totalSupply"
    });
  }
  __name(call2, "call");
  getTotalSupply2.call = call2;
})(getTotalSupply || (getTotalSupply = {}));

// node_modules/viem/_esm/actions/token/transfer.js
init_abis();
init_parseEventLogs();
init_estimateContractGas();
init_simulateContract();
init_writeContract();
init_internal();
async function transfer(client, parameters) {
  return transfer.inner(writeContract, client, parameters);
}
__name(transfer, "transfer");
(function(transfer2) {
  async function inner(action, client, parameters) {
    return await action(client, {
      ...parameters,
      ...transfer2.call(client, parameters)
    });
  }
  __name(inner, "inner");
  transfer2.inner = inner;
  function call2(client, parameters) {
    return defineCall(getCall2(client, parameters));
  }
  __name(call2, "call");
  transfer2.call = call2;
  async function estimateGas2(client, parameters) {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters),
      ...transfer2.call(client, parameters)
    });
  }
  __name(estimateGas2, "estimateGas");
  transfer2.estimateGas = estimateGas2;
  async function simulate(client, parameters) {
    return simulateContract(client, {
      ...pickWriteParameters(parameters),
      ...transfer2.call(client, parameters)
    });
  }
  __name(simulate, "simulate");
  transfer2.simulate = simulate;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: "Transfer",
      strict: true
    });
    if (!log)
      throw new Error("`Transfer` event not found.");
    return log;
  }
  __name(extractEvent, "extractEvent");
  transfer2.extractEvent = extractEvent;
})(transfer || (transfer = {}));
function getCall2(client, parameters) {
  const { amount, from: from16, to, token } = parameters;
  const { address, decimals } = resolveToken(client, { token });
  const value = toBaseUnits(amount, decimals);
  if (from16)
    return {
      abi: erc20Abi,
      address,
      args: [from16, to, value],
      functionName: "transferFrom"
    };
  return {
    abi: erc20Abi,
    address,
    args: [to, value],
    functionName: "transfer"
  };
}
__name(getCall2, "getCall");

// node_modules/viem/_esm/actions/token/transferSync.js
init_formatUnits();
init_writeContractSync();
init_internal();
async function transferSync(client, parameters) {
  const { amount, token, throwOnReceiptRevert = true } = parameters;
  const { decimals } = resolveToken(client, { token });
  const resolved = resolveAmountDecimals(amount, decimals);
  const receipt = await transfer.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert
  });
  const { args } = transfer.extractEvent(receipt.logs);
  return {
    ...args,
    ...resolved === void 0 ? {} : { decimals: resolved, formatted: formatUnits(args.value, resolved) },
    receipt
  };
}
__name(transferSync, "transferSync");

// node_modules/viem/_esm/clients/decorators/public.js
init_prepareTransactionRequest();
init_sendRawTransaction();
init_sendRawTransactionSync();
function publicActions(client) {
  return {
    call: (args) => call(client, args),
    createAccessList: (args) => createAccessList(client, args),
    createBlockFilter: () => createBlockFilter(client),
    createContractEventFilter: (args) => createContractEventFilter(client, args),
    createEventFilter: (args) => createEventFilter(client, args),
    createPendingTransactionFilter: () => createPendingTransactionFilter(client),
    estimateContractGas: (args) => estimateContractGas(client, args),
    estimateGas: (args) => estimateGas(client, args),
    getBalance: (args) => getBalance(client, args),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (args) => getBlock(client, args),
    getBlockNumber: (args) => getBlockNumber(client, args),
    getBlockReceipts: (args) => getBlockReceipts(client, args),
    getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
    getBytecode: (args) => getCode(client, args),
    getChainId: () => getChainId(client),
    getCode: (args) => getCode(client, args),
    getContractEvents: (args) => getContractEvents(client, args),
    getDelegation: (args) => getDelegation(client, args),
    getEip712Domain: (args) => getEip712Domain(client, args),
    getEnsAddress: (args) => getEnsAddress(client, args),
    getEnsAvatar: (args) => getEnsAvatar(client, args),
    getEnsName: (args) => getEnsName(client, args),
    getEnsResolver: (args) => getEnsResolver(client, args),
    getEnsText: (args) => getEnsText(client, args),
    getFeeHistory: (args) => getFeeHistory(client, args),
    estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
    getFilterChanges: (args) => getFilterChanges(client, args),
    getFilterLogs: (args) => getFilterLogs(client, args),
    getGasPrice: () => getGasPrice(client),
    getLogs: (args) => getLogs(client, args),
    getProof: (args) => getProof(client, args),
    estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
    fillTransaction: (args) => fillTransaction(client, args),
    getRawTransaction: (args) => getRawTransaction(client, args),
    getStorageAt: (args) => getStorageAt(client, args),
    getStorageValues: (args) => getStorageValues(client, args),
    getTransaction: (args) => getTransaction(client, args),
    getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
    getTransactionCount: (args) => getTransactionCount(client, args),
    getTransactionReceipt: (args) => getTransactionReceipt(client, args),
    multicall: (args) => multicall(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    readContract: (args) => readContract(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    simulate: (args) => simulateBlocks(client, args),
    simulateBlocks: (args) => simulateBlocks(client, args),
    simulateCalls: (args) => simulateCalls(client, args),
    simulateContract: (args) => simulateContract(client, args),
    verifyHash: (args) => verifyHash(client, args),
    verifyMessage: (args) => verifyMessage(client, args),
    verifySiweMessage: (args) => verifySiweMessage(client, args),
    verifyTypedData: (args) => verifyTypedData(client, args),
    uninstallFilter: (args) => uninstallFilter(client, args),
    waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
    watchBlockHeaders: (args) => watchBlockHeaders(client, args),
    watchBlocks: (args) => watchBlocks(client, args),
    watchBlockNumber: (args) => watchBlockNumber(client, args),
    watchContractEvent: (args) => watchContractEvent(client, args),
    watchEvent: (args) => watchEvent(client, args),
    watchPendingTransactions: (args) => watchPendingTransactions(client, args),
    token: bindPublicToken(client)
  };
}
__name(publicActions, "publicActions");
function bindPublicToken(client) {
  return {
    getAllowance: bindActionDecorators(client, getAllowance),
    getBalance: bindActionDecorators(client, getBalance2),
    getMetadata: bindActionDecorators(client, getMetadata),
    getTotalSupply: bindActionDecorators(client, getTotalSupply)
  };
}
__name(bindPublicToken, "bindPublicToken");

// node_modules/viem/_esm/clients/createPublicClient.js
function createPublicClient(parameters) {
  const { key = "public", name = "Public Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "publicClient"
  });
  return client.extend(publicActions);
}
__name(createPublicClient, "createPublicClient");

// node_modules/viem/_esm/clients/decorators/wallet.js
init_fillTransaction();
init_getChainId();

// node_modules/viem/_esm/actions/wallet/addChain.js
init_toHex();
async function addChain(client, { chain }) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
  await client.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : void 0
      }
    ]
  }, { dedupe: true, retryCount: 0 });
}
__name(addChain, "addChain");

// node_modules/viem/_esm/actions/wallet/deployContract.js
init_encodeDeployData();
init_sendTransaction();
function deployContract(walletClient, parameters) {
  const { abi: abi2, args, bytecode, ...request } = parameters;
  const calldata = encodeDeployData({ abi: abi2, args, bytecode });
  return sendTransaction(walletClient, {
    ...request,
    ...request.authorizationList ? { to: null } : {},
    data: calldata
  });
}
__name(deployContract, "deployContract");

// node_modules/viem/_esm/actions/wallet/getAddresses.js
init_getAddress();
async function getAddresses(client) {
  if (client.account?.type === "local")
    return [client.account.address];
  const addresses = await client.request({ method: "eth_accounts" }, { dedupe: true });
  return addresses.map((address) => checksumAddress(address));
}
__name(getAddresses, "getAddresses");

// node_modules/viem/_esm/actions/wallet/getCapabilities.js
init_parseAccount();
init_toHex();
async function getCapabilities(client, parameters = {}) {
  const { account = client.account, chainId } = parameters;
  const account_ = account ? parseAccount(account) : void 0;
  const params = chainId ? [account_?.address, [numberToHex(chainId)]] : [account_?.address];
  const capabilities_raw = await client.request({
    method: "wallet_getCapabilities",
    params
  });
  const capabilities = {};
  for (const [chainId2, capabilities_] of Object.entries(capabilities_raw)) {
    capabilities[Number(chainId2)] = {};
    for (let [key, value] of Object.entries(capabilities_)) {
      if (key === "addSubAccount")
        key = "unstable_addSubAccount";
      capabilities[Number(chainId2)][key] = value;
    }
  }
  return typeof chainId === "number" ? capabilities[chainId] : capabilities;
}
__name(getCapabilities, "getCapabilities");

// node_modules/viem/_esm/actions/wallet/getPermissions.js
async function getPermissions(client) {
  const permissions = await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
  return permissions;
}
__name(getPermissions, "getPermissions");

// node_modules/viem/_esm/actions/wallet/prepareAuthorization.js
init_parseAccount();
init_account();
init_isAddressEqual();
init_getAction();
init_getChainId();
init_getTransactionCount();
async function prepareAuthorization(client, parameters) {
  const { account: account_ = client.account, chainId, nonce } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/prepareAuthorization"
    });
  const account = parseAccount(account_);
  const executor = (() => {
    if (!parameters.executor)
      return void 0;
    if (parameters.executor === "self")
      return parameters.executor;
    return parseAccount(parameters.executor);
  })();
  const authorization = {
    address: parameters.contractAddress ?? parameters.address,
    chainId,
    nonce
  };
  if (typeof authorization.chainId === "undefined")
    authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
  if (typeof authorization.nonce === "undefined") {
    authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
    if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address))
      authorization.nonce += 1;
  }
  return authorization;
}
__name(prepareAuthorization, "prepareAuthorization");

// node_modules/viem/_esm/clients/decorators/wallet.js
init_prepareTransactionRequest();

// node_modules/viem/_esm/actions/wallet/requestAddresses.js
init_getAddress();
async function requestAddresses(client) {
  const addresses = await client.request({ method: "eth_requestAccounts" }, { dedupe: true, retryCount: 0 });
  return addresses.map((address) => getAddress(address));
}
__name(requestAddresses, "requestAddresses");

// node_modules/viem/_esm/actions/wallet/requestPermissions.js
async function requestPermissions(client, permissions) {
  return client.request({
    method: "wallet_requestPermissions",
    params: [permissions]
  }, { retryCount: 0 });
}
__name(requestPermissions, "requestPermissions");

// node_modules/viem/_esm/actions/wallet/sendCallsSync.js
init_getAction();
async function sendCallsSync(client, parameters) {
  const { chain = client.chain } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  const result = await getAction(client, sendCalls, "sendCalls")(parameters);
  const status = await getAction(client, waitForCallsStatus, "waitForCallsStatus")({
    ...parameters,
    id: result.id,
    timeout
  });
  return status;
}
__name(sendCallsSync, "sendCallsSync");

// node_modules/viem/_esm/clients/decorators/wallet.js
init_sendRawTransaction();
init_sendRawTransactionSync();
init_sendTransaction();
init_sendTransactionSync();

// node_modules/viem/_esm/actions/wallet/showCallsStatus.js
async function showCallsStatus(client, parameters) {
  const { id } = parameters;
  await client.request({
    method: "wallet_showCallsStatus",
    params: [id]
  });
  return;
}
__name(showCallsStatus, "showCallsStatus");

// node_modules/viem/_esm/actions/wallet/signAuthorization.js
init_parseAccount();
init_account();
async function signAuthorization(client, parameters) {
  const { account: account_ = client.account } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/signAuthorization"
    });
  const account = parseAccount(account_);
  if (!account.signAuthorization)
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/eip7702/signAuthorization",
      metaMessages: [
        "The `signAuthorization` Action does not support JSON-RPC Accounts."
      ],
      type: account.type
    });
  const authorization = await prepareAuthorization(client, parameters);
  return account.signAuthorization(authorization);
}
__name(signAuthorization, "signAuthorization");

// node_modules/viem/_esm/actions/wallet/signMessage.js
init_parseAccount();
init_account();
init_toHex();
async function signMessage(client, { account: account_ = client.account, message }) {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signMessage"
    });
  const account = parseAccount(account_);
  if (account.signMessage)
    return account.signMessage({ message });
  const message_ = (() => {
    if (typeof message === "string")
      return stringToHex(message);
    if (message.raw instanceof Uint8Array)
      return toHex(message.raw);
    return message.raw;
  })();
  return client.request({
    method: "personal_sign",
    params: [message_, account.address]
  }, { retryCount: 0 });
}
__name(signMessage, "signMessage");

// node_modules/viem/_esm/actions/wallet/signTransaction.js
init_parseAccount();
init_account();
init_assertCurrentChain();
init_toHex();
init_transactionRequest();
init_getAction();
init_assertRequest();
init_getChainId();
async function signTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTransaction"
    });
  const account = parseAccount(account_);
  assertRequest({
    account,
    ...parameters
  });
  const chainId = await getAction(client, getChainId, "getChainId")({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain
    });
  const formatters2 = chain?.formatters || client.chain?.formatters;
  const format2 = formatters2?.transactionRequest?.format || formatTransactionRequest;
  if (account.signTransaction)
    return account.signTransaction({
      ...transaction,
      account,
      chainId
    }, { serializer: client.chain?.serializers?.transaction });
  return await client.request({
    method: "eth_signTransaction",
    params: [
      {
        ...format2({
          ...transaction,
          account
        }, "signTransaction"),
        chainId: numberToHex(chainId),
        from: account.address
      }
    ]
  }, { retryCount: 0 });
}
__name(signTransaction, "signTransaction");

// node_modules/viem/_esm/actions/wallet/signTypedData.js
init_parseAccount();
init_account();
init_typedData2();
async function signTypedData(client, parameters) {
  const { account: account_ = client.account, domain, message, primaryType } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTypedData"
    });
  const account = parseAccount(account_);
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({ domain, message, primaryType, types });
  if (account.signTypedData)
    return account.signTypedData({ domain, message, primaryType, types });
  const typedData = serializeTypedData({ domain, message, primaryType, types });
  return client.request({
    method: "eth_signTypedData_v4",
    params: [account.address, typedData]
  }, { retryCount: 0 });
}
__name(signTypedData, "signTypedData");

// node_modules/viem/_esm/actions/wallet/switchChain.js
init_toHex();
async function switchChain(client, { id }) {
  await client.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: numberToHex(id)
      }
    ]
  }, { retryCount: 0 });
}
__name(switchChain, "switchChain");

// node_modules/viem/_esm/actions/wallet/watchAsset.js
async function watchAsset(client, params) {
  const added = await client.request({
    method: "wallet_watchAsset",
    params
  }, { retryCount: 0 });
  return added;
}
__name(watchAsset, "watchAsset");

// node_modules/viem/_esm/clients/decorators/wallet.js
init_writeContract();
init_writeContractSync();
function walletActions(client) {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    fillTransaction: (args) => fillTransaction(client, args),
    getAddresses: () => getAddresses(client),
    getCallsStatus: (args) => getCallsStatus(client, args),
    getCapabilities: (args) => getCapabilities(client, args),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareAuthorization: (args) => prepareAuthorization(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendCalls: (args) => sendCalls(client, args),
    sendCallsSync: (args) => sendCallsSync(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    sendTransactionSync: (args) => sendTransactionSync(client, args),
    showCallsStatus: (args) => showCallsStatus(client, args),
    signAuthorization: (args) => signAuthorization(client, args),
    signMessage: (args) => signMessage(client, args),
    signTransaction: (args) => signTransaction(client, args),
    signTypedData: (args) => signTypedData(client, args),
    switchChain: (args) => switchChain(client, args),
    waitForCallsStatus: (args) => waitForCallsStatus(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args),
    writeContractSync: (args) => writeContractSync(client, args),
    token: {
      approve: bindActionDecorators(client, approve),
      approveSync: bindActionDecorators(client, approveSync),
      transfer: bindActionDecorators(client, transfer),
      transferSync: bindActionDecorators(client, transferSync)
    }
  };
}
__name(walletActions, "walletActions");

// node_modules/viem/_esm/clients/createWalletClient.js
function createWalletClient(parameters) {
  const { key = "wallet", name = "Wallet Client", transport } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: "walletClient"
  });
  return client.extend(walletActions);
}
__name(createWalletClient, "createWalletClient");

// node_modules/viem/_esm/clients/transports/createTransport.js
init_buildRequest();
function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
  const uid2 = uid();
  return {
    config: {
      key,
      methods,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type
    },
    request: buildRequest(request, { methods, retryCount, retryDelay, uid: uid2 }),
    value
  };
}
__name(createTransport, "createTransport");

// node_modules/viem/_esm/clients/transports/http.js
init_request();

// node_modules/viem/_esm/errors/transport.js
init_base();
var UrlRequiredError = class extends BaseError2 {
  constructor() {
    super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
      docsPath: "/docs/clients/intro",
      name: "UrlRequiredError"
    });
  }
};
__name(UrlRequiredError, "UrlRequiredError");

// node_modules/viem/_esm/clients/transports/http.js
init_createBatchScheduler();
init_http();
var signalId = 0;
var signalIds = /* @__PURE__ */ new WeakMap();
function getSignalId(signal) {
  if (!signal)
    return "default";
  const id = signalIds.get(signal);
  if (id !== void 0)
    return id;
  const nextId = signalId++;
  signalIds.set(signal, nextId);
  return nextId;
}
__name(getSignalId, "getSignalId");
function http(url, config = {}) {
  const { batch, fetchFn, fetchOptions, key = "http", maxResponseBodySize, methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay, raw } = config;
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1e3, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
    const retryCount = config.retryCount ?? retryCount_;
    const timeout = timeout_ ?? config.timeout ?? 1e4;
    const url_ = url || chain?.rpcUrls.default.http[0];
    if (!url_)
      throw new UrlRequiredError();
    const rpcClient = getHttpRpcClient(url_, {
      fetchFn,
      fetchOptions,
      maxResponseBodySize,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout
    });
    return createTransport({
      key,
      methods,
      name,
      async request({ method, params }, options) {
        const body = { method, params };
        const fetchOptions2 = options?.signal ? { signal: options.signal } : void 0;
        const { schedule } = createBatchScheduler({
          id: `${url_}.${getSignalId(options?.signal)}`,
          wait: wait2,
          shouldSplitBatch(requests) {
            return requests.length > batchSize;
          },
          fn: (body2) => rpcClient.request({
            body: body2,
            fetchOptions: fetchOptions2
          }),
          sort: (a, b) => a.id - b.id
        });
        const fn = /* @__PURE__ */ __name(async (body2) => batch ? schedule(body2) : [
          await rpcClient.request({
            body: body2,
            fetchOptions: fetchOptions2
          })
        ], "fn");
        const [{ error, result }] = await fn(body);
        if (raw)
          return { error, result };
        if (error)
          throw new RpcRequestError({
            body,
            error,
            url: url_
          });
        return result;
      },
      retryCount,
      retryDelay,
      timeout,
      type: "http"
    }, {
      fetchOptions,
      url: url_
    });
  };
}
__name(http, "http");

// node_modules/viem/_esm/index.js
init_toHex();
init_keccak256();

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
init_secp256k1();
init_toHex();

// node_modules/viem/_esm/accounts/toAccount.js
init_address();
init_isAddress();
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    signAuthorization: source.signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}
__name(toAccount, "toAccount");

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
init_publicKeyToAddress();

// node_modules/viem/_esm/accounts/utils/sign.js
init_secp256k1();
init_isHex();
init_toBytes();
init_toHex();
var extraEntropy = false;
async function sign({ hash: hash3, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash3.slice(2), privateKey.slice(2), {
    lowS: true,
    extraEntropy: isHex(extraEntropy, { strict: false }) ? hexToBytes(extraEntropy) : extraEntropy
  });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}
__name(sign, "sign");

// node_modules/viem/_esm/accounts/utils/signAuthorization.js
init_hashAuthorization();
async function signAuthorization2(parameters) {
  const { chainId, nonce, privateKey, to = "object" } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      address,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}
__name(signAuthorization2, "signAuthorization");

// node_modules/viem/_esm/accounts/utils/signMessage.js
init_hashMessage();
async function signMessage2({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}
__name(signMessage2, "signMessage");

// node_modules/viem/_esm/accounts/utils/signTransaction.js
init_keccak256();
init_serializeTransaction();
async function signTransaction2(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey
  });
  return await serializer(transaction, signature);
}
__name(signTransaction2, "signTransaction");

// node_modules/viem/_esm/accounts/utils/signTypedData.js
init_hashTypedData();
async function signTypedData2(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}
__name(signTypedData2, "signTypedData");

// node_modules/viem/_esm/accounts/privateKeyToAccount.js
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash: hash3 }) {
      return sign({ hash: hash3, privateKey, to: "hex" });
    },
    async signAuthorization(authorization) {
      return signAuthorization2({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage2({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction2({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData2({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}
__name(privateKeyToAccount, "privateKeyToAccount");

// node_modules/viem/_esm/op-stack/contracts.js
var contracts = {
  gasPriceOracle: { address: "0x420000000000000000000000000000000000000F" },
  l1Block: { address: "0x4200000000000000000000000000000000000015" },
  l2CrossDomainMessenger: {
    address: "0x4200000000000000000000000000000000000007"
  },
  l2Erc721Bridge: { address: "0x4200000000000000000000000000000000000014" },
  l2StandardBridge: { address: "0x4200000000000000000000000000000000000010" },
  l2ToL1MessagePasser: {
    address: "0x4200000000000000000000000000000000000016"
  }
};

// node_modules/viem/_esm/op-stack/formatters.js
init_fromHex();
init_block2();
init_transaction2();
init_transactionReceipt();
var formatters = {
  block: /* @__PURE__ */ defineBlock({
    format(args) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string")
          return transaction;
        const formatted = formatTransaction(transaction);
        if (formatted.typeHex === "0x7e") {
          formatted.isSystemTx = transaction.isSystemTx;
          formatted.mint = transaction.mint ? hexToBigInt(transaction.mint) : void 0;
          formatted.sourceHash = transaction.sourceHash;
          formatted.type = "deposit";
        }
        return formatted;
      });
      return {
        transactions,
        stateRoot: args.stateRoot
      };
    }
  }),
  transaction: /* @__PURE__ */ defineTransaction({
    format(args) {
      const transaction = {};
      if (args.type === "0x7e") {
        transaction.isSystemTx = args.isSystemTx;
        transaction.mint = args.mint ? hexToBigInt(args.mint) : void 0;
        transaction.sourceHash = args.sourceHash;
        transaction.type = "deposit";
      }
      return transaction;
    }
  }),
  transactionReceipt: /* @__PURE__ */ defineTransactionReceipt({
    format(args) {
      return {
        ...args.depositNonce ? { depositNonce: hexToBigInt(args.depositNonce) } : {},
        ...args.depositReceiptVersion ? { depositReceiptVersion: hexToNumber(args.depositReceiptVersion) } : {},
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null
      };
    }
  })
};

// node_modules/viem/_esm/op-stack/serializers.js
init_address();
init_isAddress();
init_concat();
init_toHex();
init_toRlp();
init_serializeTransaction();
function serializeTransaction2(transaction, signature) {
  if (isDeposit(transaction))
    return serializeTransactionDeposit(transaction);
  return serializeTransaction(transaction, signature);
}
__name(serializeTransaction2, "serializeTransaction");
var serializers = {
  transaction: serializeTransaction2
};
function serializeTransactionDeposit(transaction) {
  assertTransactionDeposit(transaction);
  const { sourceHash, data, from: from16, gas, isSystemTx, mint, to, value } = transaction;
  const serializedTransaction = [
    sourceHash,
    from16,
    to ?? "0x",
    mint ? toHex(mint) : "0x",
    value ? toHex(value) : "0x",
    gas ? toHex(gas) : "0x",
    isSystemTx ? "0x1" : "0x",
    data ?? "0x"
  ];
  return concatHex([
    "0x7e",
    toRlp(serializedTransaction)
  ]);
}
__name(serializeTransactionDeposit, "serializeTransactionDeposit");
function isDeposit(transaction) {
  if (transaction.type === "deposit")
    return true;
  if (typeof transaction.sourceHash !== "undefined")
    return true;
  return false;
}
__name(isDeposit, "isDeposit");
function assertTransactionDeposit(transaction) {
  const { from: from16, to } = transaction;
  if (from16 && !isAddress(from16))
    throw new InvalidAddressError({ address: from16 });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
}
__name(assertTransactionDeposit, "assertTransactionDeposit");

// node_modules/viem/_esm/op-stack/chainConfig.js
var chainConfig = {
  blockTime: 2e3,
  contracts,
  formatters,
  serializers
};

// node_modules/viem/_esm/chains/definitions/base.js
init_defineChain();
var sourceId = 1;
var base = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
      apiUrl: "https://api.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: "0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e"
      }
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0x56315b90c40730925ec5485cf004d835058518A0"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022
    },
    portal: {
      [sourceId]: {
        address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
        blockCreated: 17482143
      }
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        blockCreated: 17482143
      }
    }
  },
  sourceId
});
var basePreconf = /* @__PURE__ */ defineChain({
  ...base,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://mainnet-preconf.base.org"]
    }
  }
});

// node_modules/viem/_esm/chains/definitions/baseSepolia.js
init_defineChain();
var sourceId2 = 11155111;
var baseSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 84532,
  network: "base-sepolia",
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://sepolia.basescan.org",
      apiUrl: "https://api-sepolia.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId2]: {
        address: "0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1"
      }
    },
    l2OutputOracle: {
      [sourceId2]: {
        address: "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254"
      }
    },
    portal: {
      [sourceId2]: {
        address: "0x49f53e41452c74589e85ca1677426ba426459e85",
        blockCreated: 4446677
      }
    },
    l1StandardBridge: {
      [sourceId2]: {
        address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120",
        blockCreated: 4446677
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1059647
    }
  },
  testnet: true,
  sourceId: sourceId2
});
var baseSepoliaPreconf = /* @__PURE__ */ defineChain({
  ...baseSepolia,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://sepolia-preconf.base.org"]
    }
  }
});

// src/facilitator/selfhosted.ts
var RPCS = {
  "eip155:8453": ["https://mainnet.base.org", "https://base.llamarpc.com"],
  "eip155:84532": ["https://sepolia.base.org", "https://base-sepolia.gateway.tenderly.co"]
};
var USDC_TRANSFER_SIG = keccak256(stringToHex("Transfer(address,address,uint256)"));
var USDC_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "permit",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "nonces",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }]
  }
];
var SelfHostedFacilitator = class {
  name = "selfhosted";
  async healthCheck(env) {
    if (!env.SELFHOSTED_PRIVATE_KEY) {
      if (env.PAY_TO && !env.PAY_TO.includes("PLACEHOLDER"))
        return { ok: true };
      return { ok: false, error: "no_selfhosted_key" };
    }
    if (!env.PAY_TO)
      return { ok: false, error: "no_pay_to" };
    try {
      const transport = http(RPCS[env.NETWORK]?.[0] ?? "https://sepolia.base.org", {
        timeout: 2e4,
        batch: false
      });
      const publicClient = createPublicClient({ chain: env.NETWORK === "eip155:8453" ? base : baseSepolia, transport });
      const c = await publicClient.getBlockNumber();
      return { ok: c > 0n };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async settle(env, req) {
    const t0 = Date.now();
    const done = /* @__PURE__ */ __name((patch) => ({
      ...patch,
      latencyMs: Date.now() - t0
    }), "done");
    const key = env.SELFHOSTED_PRIVATE_KEY;
    const hasAuth = Boolean(req.payment.payload?.authorization);
    if (!key && hasAuth) {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_selfhosted_key" });
    }
    const payTo = env.PAY_TO;
    if (!payTo || payTo.includes("PLACEHOLDER")) {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "no_pay_to" });
    }
    const amount = BigInt(req.amountRequired || "500000");
    const authorization = req.payment.payload?.authorization;
    const rpcs = RPCS[env.NETWORK];
    if (!rpcs)
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "unsupported_network:" + env.NETWORK });
    const chain = env.NETWORK === "eip155:8453" ? base : baseSepolia;
    const publicClient = createPublicClient({ chain, transport: http(rpcs[0], { timeout: 2e4, batch: false }) });
    if (authorization) {
      return this.settleSigned(env, publicClient, req, payTo, amount, done);
    }
    return this.settleCapture(env, publicClient, req, payTo, amount, done);
  }
  // ── Rail A: plain capture（testnet）──
  async settleCapture(env, publicClient, req, payTo, amount, done) {
    if (env.NETWORK === "eip155:8453") {
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "mainnet_requires_authorization" });
    }
    const payer = req.payment.payload?.payer;
    const txHash = req.payment.payload?.txHash;
    if (!payer || !txHash) {
      return done({ ok: false, amount: "0", payer: payer ?? "unknown", txHash: txHash ?? "", error: "missing_capture_fields" });
    }
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    } catch {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_tx_not_found" });
    }
    if (receipt.status !== "success") {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_tx_reverted" });
    }
    const key = env.SELFHOSTED_PRIVATE_KEY;
    const facilitatorAddress = key ? privateKeyToAccount(key).address.toLowerCase() : payTo.toLowerCase();
    const usdc = env.ASSET_USDC.toLowerCase();
    let captured = null;
    const debugLog = [];
    for (const log of receipt.logs) {
      const logAddr = String(log.address).toLowerCase();
      const t0 = String(log.topics[0]).toLowerCase();
      const t1 = String(log.topics[1]).slice(26).toLowerCase();
      const t2 = String(log.topics[2]).slice(26).toLowerCase();
      const from16 = "0x" + t1;
      const to = "0x" + t2;
      debugLog.push(`log:addr=${logAddr} usdc=${usdc} match=${logAddr === usdc} | t0=${t0} sig=${USDC_TRANSFER_SIG} match=${t0 === USDC_TRANSFER_SIG} | from=${from16} payer=${payer.toLowerCase()} match=${from16 === payer.toLowerCase()} | to=${to} fac=${facilitatorAddress} match=${to === facilitatorAddress}`);
      if (String(log.address).toLowerCase() !== usdc)
        continue;
      if (log.topics.length < 3)
        continue;
      if (String(log.topics[0]).toLowerCase() !== USDC_TRANSFER_SIG)
        continue;
      if (from16 !== payer.toLowerCase() || to !== facilitatorAddress)
        continue;
      captured = BigInt(log.data);
      break;
    }
    console.log("[selfhosted] settleCapture logs:", JSON.stringify(debugLog));
    if (captured === null || captured === 0n) {
      return done({ ok: false, amount: "0", payer, txHash, error: "capture_transfer_not_found" });
    }
    if (captured < amount) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "capture_underpaid" });
    }
    if (captured > 2n * amount) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "capture_overpaid_guard" });
    }
    if (payTo.toLowerCase() === facilitatorAddress) {
      return done({ ok: true, amount: captured.toString(), payer, txHash });
    }
    const account = privateKeyToAccount(env.SELFHOSTED_PRIVATE_KEY);
    const walletClient = createWalletClient({ account, chain: publicClient.chain, transport: publicClient.transport });
    let settleHash;
    try {
      settleHash = await walletClient.writeContract({
        address: env.ASSET_USDC,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [payTo, captured],
        chain: publicClient.chain
      });
    } catch (e) {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_submit_failed:" + String(e?.shortMessage ?? e) });
    }
    let sr;
    try {
      sr = await publicClient.waitForTransactionReceipt({ hash: settleHash, timeout: 6e4 });
    } catch {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_pending_timeout:" + settleHash });
    }
    if (sr.status !== "success") {
      return done({ ok: false, amount: captured.toString(), payer, txHash, error: "settle_reverted:" + settleHash });
    }
    return done({ ok: true, amount: captured.toString(), payer, txHash: settleHash });
  }
  // ── Rail B: signed authorization（mainnet 標準）──
  async settleSigned(env, publicClient, req, payTo, amount, done) {
    const payer = req.payment.payload?.payer;
    if (!payer)
      return done({ ok: false, amount: "0", payer: "unknown", txHash: "", error: "missing_payer" });
    let auth;
    try {
      auth = JSON.parse(atob(req.payment.payload.authorization));
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "authorization_malformed" });
    }
    if (String(auth.asset ?? "").toLowerCase() !== env.ASSET_USDC.toLowerCase()) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_asset_mismatch" });
    }
    if (String(auth.to ?? "").toLowerCase() !== payTo.toLowerCase()) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_to_mismatch" });
    }
    let authValue;
    try {
      authValue = BigInt(auth.value);
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_value_invalid" });
    }
    if (authValue !== amount) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_value_mismatch" });
    }
    const nowS = Math.floor(Date.now() / 1e3);
    const validAfter = Number(auth.validAfter ?? 0);
    const validBefore = Number(auth.validBefore ?? 0);
    if (!Number.isFinite(validBefore) || nowS < validAfter || nowS > validBefore) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_outside_window" });
    }
    const nonce = String(auth.nonce ?? "");
    if (!nonce)
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_no_nonce" });
    const canonical = [env.ASSET_USDC, payTo, amount.toString(), validAfter, validBefore, nonce, payer].join("|");
    const verified = await publicClient.verifyMessage({
      address: payer,
      message: { raw: toHex(canonical) },
      signature: auth.signature
    }).catch(() => false);
    if (!verified) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_signature_invalid" });
    }
    const nkey = `permitnonce:${payer.toLowerCase()}:${nonce}`;
    if (env.KV) {
      const used = await env.KV.get(nkey);
      if (used)
        return done({ ok: false, amount: "0", payer, txHash: "", error: "nonce_reused" });
    }
    const account = privateKeyToAccount(env.SELFHOSTED_PRIVATE_KEY);
    const walletClient = createWalletClient({ account, chain: publicClient.chain, transport: publicClient.transport });
    const usdc = env.ASSET_USDC;
    const allowance = await publicClient.readContract({ address: usdc, abi: USDC_ABI, functionName: "allowance", args: [payer, payTo] }).catch(() => 0n);
    if (allowance < amount) {
      const onChainNonce = await publicClient.readContract({ address: usdc, abi: USDC_ABI, functionName: "nonces", args: [payer] }).catch(() => 0n);
      if (BigInt(nonce) < onChainNonce) {
        return done({ ok: false, amount: "0", payer, txHash: "", error: "nonce_consumed_onchain" });
      }
      const v = Number(auth.v ?? 27);
      const r = auth.r;
      const s = auth.s;
      if (!r || !s)
        return done({ ok: false, amount: "0", payer, txHash: "", error: "auth_missing_rs" });
      let permitHash;
      try {
        permitHash = await walletClient.writeContract({
          address: usdc,
          abi: USDC_ABI,
          functionName: "permit",
          args: [payer, payTo, amount, BigInt(validBefore), BigInt(nonce), v, r, s],
          chain: publicClient.chain
        });
      } catch (e) {
        return done({ ok: false, amount: "0", payer, txHash: "", error: "permit_submit_failed:" + String(e?.shortMessage ?? e) });
      }
      let pr;
      try {
        pr = await publicClient.waitForTransactionReceipt({ hash: permitHash, timeout: 6e4 });
      } catch {
        return done({ ok: false, amount: "0", payer, txHash: permitHash, error: "permit_pending_timeout" });
      }
      if (pr.status !== "success") {
        return done({ ok: false, amount: "0", payer, txHash: permitHash, error: "permit_reverted" });
      }
    }
    let settleHash;
    try {
      settleHash = await walletClient.writeContract({
        address: usdc,
        abi: USDC_ABI,
        functionName: "transferFrom",
        args: [payer, payTo, amount],
        chain: publicClient.chain
      });
    } catch (e) {
      return done({ ok: false, amount: "0", payer, txHash: "", error: "settle_submit_failed:" + String(e?.shortMessage ?? e) });
    }
    let sr;
    try {
      sr = await publicClient.waitForTransactionReceipt({ hash: settleHash, timeout: 6e4 });
    } catch {
      return done({ ok: false, amount: "0", payer, txHash: settleHash, error: "settle_pending_timeout" });
    }
    if (sr.status !== "success") {
      return done({ ok: false, amount: "0", payer, txHash: settleHash, error: "settle_reverted" });
    }
    if (env.KV) {
      await env.KV.put(nkey, "1", { expirationTtl: 30 * 24 * 3600 });
    }
    return done({ ok: true, amount: amount.toString(), payer, txHash: settleHash });
  }
};
__name(SelfHostedFacilitator, "SelfHostedFacilitator");

// src/facilitator/circuit.ts
var CircuitBreaker = class {
  constructor(cfg = { openAfter: 5, halfAfterMs: 6e4 }) {
    this.cfg = cfg;
  }
  failures = 0;
  openedAt = 0;
  state = "closed";
  get current() {
    if (this.state === "open" && Date.now() - this.openedAt > this.cfg.halfAfterMs) {
      this.state = "half-open";
    }
    return this.state;
  }
  canProceed() {
    const s = this.current;
    return s === "closed" || s === "half-open";
  }
  recordSuccess() {
    this.failures = 0;
    this.state = "closed";
  }
  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.cfg.openAfter) {
      this.state = "open";
      this.openedAt = Date.now();
    }
  }
};
__name(CircuitBreaker, "CircuitBreaker");

// src/facilitator/router.ts
var cdp = new CDPFacilitator();
var selfhosted = new SelfHostedFacilitator();
async function routeAndSettle(env, opts) {
  const primary = opts.facilitatorName ?? env.FACILITATOR_PRIMARY ?? "cdp";
  const order = primary === "cdp" ? ["cdp", "selfhosted"] : ["selfhosted", "cdp"];
  const circuitBreakers = {
    cdp: new CircuitBreaker({
      openAfter: parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10),
      halfAfterMs: parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10)
    }),
    selfhosted: new CircuitBreaker({
      openAfter: parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10),
      halfAfterMs: parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10)
    })
  };
  const circuitOpened = [];
  const facEnv = {
    FACILITATOR_URL: env.FACILITATOR_URL,
    CDP_API_KEY: env.CDP_API_KEY,
    CDP_PRIVATE_KEY: env.CDP_PRIVATE_KEY,
    SELFHOSTED_PRIVATE_KEY: env.SELFHOSTED_PRIVATE_KEY,
    PAY_TO: env.PAY_TO,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC,
    OWNSITE_BASE: env.OWNSITE_BASE,
    KV: env.KV
    // v1.15：簽名 rail nonce 去重 + KV circuit breaker
  };
  const openAfter = parseInt(env.FACILITATOR_CIRCUIT_OPEN_AFTER || "5", 10);
  const halfAfterMs = parseInt(env.FACILITATOR_CIRCUIT_HALF_AFTER || "60000", 10);
  for (const name of order) {
    let open = false;
    let halfProbe = false;
    if (env.KV) {
      const g = await kvCircuitGate(env.KV, name, openAfter, halfAfterMs);
      open = g.open;
      halfProbe = g.half;
    } else {
      open = !circuitBreakers[name].canProceed();
    }
    if (open) {
      circuitOpened.push(name);
      continue;
    }
    const fac = name === "cdp" ? cdp : selfhosted;
    const req = {
      payment: opts.payment,
      packageId: opts.packageId,
      amountRequired: opts.amountRequired
    };
    if (env.MOCK_FACILITATOR === "1") {
      if (process.env.ENVIRONMENT === "production") {
        throw new Error("FATAL: MOCK_FACILITATOR forbidden in production");
      }
      const res2 = {
        ok: true,
        amount: opts.amountRequired,
        payer: opts.payment.payload?.payer ?? "0xmock",
        txHash: opts.payment.payload?.txHash ?? "",
        latencyMs: 1
      };
      if (env.KV)
        await env.KV.delete("cb:" + name).catch(() => {
        });
      else
        circuitBreakers[name].recordSuccess();
      await recordSettle(env, {
        txHash: res2.txHash,
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "settled",
        amountUsdc: res2.amount,
        payer: res2.payer,
        network: opts.payment.network,
        latencyMs: 1
      });
      return { ...res2, facilitator: name, circuit_opened: circuitOpened };
    }
    const res = await fac.settle(facEnv, req);
    if (res.ok) {
      if (env.KV)
        await env.KV.delete("cb:" + name).catch(() => {
        });
      else
        circuitBreakers[name].recordSuccess();
      await recordSettle(env, {
        txHash: res.txHash,
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "settled",
        amountUsdc: res.amount,
        payer: res.payer,
        network: opts.payment.network,
        latencyMs: res.latencyMs
      });
      return { ...res, facilitator: name, circuit_opened: circuitOpened };
    } else {
      if (env.KV)
        await kvCircuitFail(env.KV, name, openAfter, halfProbe);
      else
        circuitBreakers[name].recordFailure();
      await recordSettle(env, {
        txHash: opts.payment.payload?.txHash ?? "",
        packageId: opts.packageId,
        facilitator: name,
        attempt: 1,
        result: "facilitator_error",
        error: res.error,
        network: opts.payment.network,
        latencyMs: res.latencyMs
      });
      continue;
    }
  }
  return {
    ok: false,
    amount: "0",
    payer: "unknown",
    txHash: opts.payment.payload?.txHash ?? "",
    error: "all_facilitators_failed",
    facilitator: "none",
    circuit_opened: circuitOpened
  };
}
__name(routeAndSettle, "routeAndSettle");
async function kvCircuitGate(kv, name, openAfter, halfAfterMs) {
  const raw = await kv.get("cb:" + name, "json").catch(() => null);
  if (!raw || !raw.f)
    return { open: false, half: false };
  if (typeof raw.openedAt === "number") {
    if (Date.now() - raw.openedAt < halfAfterMs)
      return { open: true, half: false };
    return { open: false, half: true };
  }
  if (raw.f >= openAfter)
    return { open: true, half: false };
  return { open: false, half: false };
}
__name(kvCircuitGate, "kvCircuitGate");
async function kvCircuitFail(kv, name, openAfter, wasHalfProbe) {
  const raw = await kv.get("cb:" + name, "json").catch(() => null);
  const f = (raw?.f ?? 0) + 1;
  const v = { f };
  if (f >= openAfter || wasHalfProbe)
    v.openedAt = Date.now();
  await kv.put("cb:" + name, JSON.stringify(v), { expirationTtl: 3600 }).catch(() => {
  });
}
__name(kvCircuitFail, "kvCircuitFail");

// src/crypto/canonical.ts
import { createHash } from "node:crypto";
function canonicalize(value) {
  if (value === null || value === void 0)
    return "null";
  const t = typeof value;
  if (t === "string" || t === "boolean")
    return JSON.stringify(value);
  if (t === "number") {
    if (!Number.isFinite(value))
      return "null";
    return String(value);
  }
  if (t === "bigint")
    return String(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  if (t === "object") {
    const obj = value;
    const keys = Object.keys(obj).filter((k) => obj[k] !== void 0).sort();
    return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalize(obj[k])).join(",") + "}";
  }
  throw new Error("canonicalize: unsupported type " + t);
}
__name(canonicalize, "canonicalize");
function sha256Hex(input) {
  const h = createHash("sha256");
  if (typeof input === "string")
    h.update(input, "utf8");
  else
    h.update(input);
  return h.digest("hex");
}
__name(sha256Hex, "sha256Hex");

// src/worker/buy.ts
async function handleBuy(req, env, opts) {
  const id = parseIdFromPath(req.url);
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const status = await opts.getPackageStatus(id);
  if (status === "recalled") {
    const replacement = await opts.getReplacement(id);
    return json(
      { error: "pack_recalled", replacement_package_id: replacement ?? null },
      410
    );
  }
  if (status === "stale") {
    const replacement = await opts.getReplacement(id);
    return json(
      { error: "pack_stale", replacement_package_id: replacement ?? null },
      410
    );
  }
  const paymentHeader = req.headers.get("x-payment");
  if (!paymentHeader) {
    const meta = await opts.getPackageMeta(id);
    if (!meta)
      return json({ error: "not_found" }, 404);
    return paymentRequiredResponse(id, meta, env);
  }
  let payment;
  try {
    payment = JSON.parse(atob(paymentHeader));
  } catch {
    return json({ error: "bad_payment_header" }, 400);
  }
  if (payment.scheme !== "exact") {
    return json({ error: "unsupported_scheme" }, 403);
  }
  if (payment.network !== env.NETWORK) {
    return json({ error: "unsupported_network" }, 403);
  }
  const txHash = payment.payload?.txHash;
  if (!txHash)
    return json({ error: "missing_tx_hash" }, 400);
  const seen = await env.KV.get(`tx:${txHash}`);
  if (seen) {
    return json({ error: "tx_replay" }, 403);
  }
  const settle = await routeAndSettle(env, {
    payment,
    packageId: id,
    amountRequired: PRICE_STANDARD_6DECIMAL
  });
  if (!settle.ok) {
    return json({ error: "settlement_failed", reason: settle.error }, 403);
  }
  await env.KV.put(`tx:${txHash}`, "1", {
    expirationTtl: TX_REPLAY_TTL_SECONDS
  });
  const pseudonym = await derivePseudonym(settle.payer);
  await env.DB.prepare(
    "INSERT INTO payments (agent_pseudonym, package_id, amount_usdc, tx_hash, network, called_at) VALUES (?,?,?,?,?,?)"
  ).bind(pseudonym, id, settle.amount, txHash, env.NETWORK, (/* @__PURE__ */ new Date()).toISOString()).run();
  const [data, verification] = await Promise.all([
    opts.getData(id),
    opts.getVerification(id)
  ]);
  if (!data || !verification) {
    return json(
      { error: "internal_inconsistency", tx_hash: txHash },
      500
    );
  }
  const purchasedAt = (/* @__PURE__ */ new Date()).toISOString();
  return json({
    data,
    verification_snapshot: {
      ...verification,
      snapshotted_at: purchasedAt
    },
    current_data_hash: "sha256:" + sha256Hex(canonicalize(data)),
    receipt: {
      tx_hash: txHash,
      network: env.NETWORK,
      amount_usdc: settle.amount,
      purchased_at: purchasedAt
    }
  });
}
__name(handleBuy, "handleBuy");
function paymentRequiredResponse(id, meta, env) {
  const accept = {
    scheme: "exact",
    network: env.NETWORK,
    amount: meta.tier === "featured" ? PRICE_FEATURED_6DECIMAL : PRICE_STANDARD_6DECIMAL,
    resource: `${env.OWNSITE_BASE}/buy/${id}`,
    description: `${meta.title} \u2014 q=${meta.q.toFixed(2)}, evidence=${meta.evidence_count}, expires ${meta.expires_at.slice(0, 10)}`,
    mimeType: "application/json",
    payTo: env.PAY_TO ?? "0xPLACEHOLDER_PAY_TO",
    maxTimeoutSeconds: 300,
    asset: env.ASSET_USDC,
    extra: { name: "USDC", version: "2" },
    extensions: {
      bazaar: {
        info: { input: { type: "http", method: "GET" }, output: { example: "application/json" } },
        name: meta.title ?? "Agent2Agent Service",
        description: `${meta.title} \u2014 x402 verified capability (q=${meta.q.toFixed(2)})`,
        tags: ["agent", "x402", "a2a", meta.tier ?? "standard"],
        schema: { type: "object", url: `${env.OWNSITE_BASE}/.well-known/agent-index.json` }
      }
    }
  };
  const payload = {
    x402Version: 2,
    resource: {
      url: accept.resource,
      description: accept.description
    },
    accepts: [accept],
    extensions: accept.extensions
  };
  return new Response(
    JSON.stringify(payload),
    {
      status: 402,
      headers: {
        "content-type": "application/json",
        "PAYMENT-REQUIRED": Buffer.from(JSON.stringify(payload)).toString("base64"),
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type, x-payment, PAYMENT-SIGNATURE"
      }
    }
  );
}
__name(paymentRequiredResponse, "paymentRequiredResponse");
function parseIdFromPath(url) {
  const m = url.match(/\/buy\/([^/?#]+)/);
  if (!m)
    return null;
  return decodeURIComponent(m[1]);
}
__name(parseIdFromPath, "parseIdFromPath");

// src/worker/mcp-tools.ts
var MCP_TOOLS = [
  {
    name: "list_verified_packages",
    description: "List packages filtered by q, evidence_count and age. Free.",
    inputSchema: {
      type: "object",
      properties: {
        min_q: { type: "number" },
        min_evidence: { type: "integer" },
        max_age_days: { type: "integer" }
      }
    }
  },
  {
    name: "get_verification",
    description: "Return full verification.json. Free and does not consume quota.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } }
    }
  },
  {
    name: "purchase_package",
    description: "x402-gated purchase. Returns 402 accepts array if no valid payment.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } }
    }
  },
  {
    name: "check_status",
    description: "Return fresh / stale / recalled and replacement_package_id if any. Free.",
    inputSchema: {
      type: "object",
      required: ["package_id"],
      properties: { package_id: { type: "string" } }
    }
  }
];
var MCP_INSTRUCTIONS = "Always call get_verification before purchase_package. Verification is free and does not consume quota.";
var MCP_TOOL_NAMES = MCP_TOOLS.map((t) => t.name);

// src/worker/mcp.ts
async function handleMcp(req, env) {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return json({
      jsonrpc: "2.0",
      id: 0,
      error: { code: -32700, message: "parse_error" }
    });
  }
  const { id, method, params } = body;
  switch (method) {
    case "initialize":
      return json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "ownsite-verified-data", version: "1.0.0" },
          instructions: MCP_INSTRUCTIONS
        }
      });
    case "tools/list":
      return json({
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS }
      });
    case "tools/call": {
      const name = params?.name ?? "";
      const args = params?.arguments ?? {};
      if (name === "list_verified_packages") {
        const index2 = await env.KV.get(
          "wellknown:/.well-known/agent-index.json",
          "json"
        );
        let pkgs = index2?.packages ?? [];
        const minQ = args.min_q;
        const minEv = args.min_evidence;
        const maxAgeDays = args.max_age_days;
        if (minQ != null)
          pkgs = pkgs.filter((p) => Number(p.q) >= minQ);
        if (minEv != null)
          pkgs = pkgs.filter((p) => Number(p.evidence_count) >= minEv);
        if (maxAgeDays != null) {
          const now = Date.now();
          pkgs = pkgs.filter((p) => {
            const v = new Date(String(p.verified_at)).getTime();
            return now - v <= maxAgeDays * 864e5;
          });
        }
        return mcpSuccess(id, { packages: pkgs });
      }
      if (name === "get_verification") {
        const v = await env.KV.get(`verify:${args.package_id}`, "json");
        if (!v)
          return mcpError(id, -32001, "not_found");
        return mcpSuccess(id, v);
      }
      if (name === "check_status") {
        const status = await env.KV.get(`status:${args.package_id}`) ?? "unknown";
        const replacement = await env.KV.get(`replacement:${args.package_id}`);
        return mcpSuccess(id, { status, replacement_package_id: replacement ?? null });
      }
      if (name === "purchase_package") {
        return mcpError(id, -32e3, "use_http_402_flow", {
          buy_url: `${env.OWNSITE_BASE}/buy/${args.package_id}`
        });
      }
      return mcpError(id, -32602, `unknown_tool:${name}`);
    }
    default:
      return json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: "method_not_found" }
      });
  }
}
__name(handleMcp, "handleMcp");
function mcpSuccess(id, data) {
  return json({
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: JSON.stringify(data) }] }
  });
}
__name(mcpSuccess, "mcpSuccess");
function mcpError(id, code, message, data) {
  return json({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...data ? { data } : {} }
  });
}
__name(mcpError, "mcpError");

// src/worker/internal-sync.ts
async function handleInternalSync(req, env) {
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }
  const key = req.headers.get("x-sync-key");
  if (!env.SYNC_SIGNING_KEY || key !== env.SYNC_SIGNING_KEY) {
    return json({ error: "unauthorized" }, 401);
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  const results = [];
  const ops = [];
  for (const f of body.files ?? []) {
    if (!f.path.startsWith("/.well-known/") && !f.path.startsWith("/schemas/")) {
      results.push({ path: f.path, ok: false, error: "not_allowed_path" });
      continue;
    }
    const k = `wellknown:${f.path}`;
    ops.push(
      env.KV.put(k, f.content).then(() => {
        results.push({ path: f.path, ok: true });
      }).catch((e) => {
        results.push({ path: f.path, ok: false, error: String(e) });
      })
    );
  }
  for (const path of body.clear ?? []) {
    ops.push(
      env.KV.delete(`wellknown:${path}`).then(() => {
        results.push({ path, ok: true });
      }).catch((e) => {
        results.push({ path, ok: false, error: String(e) });
      })
    );
  }
  await Promise.all(ops);
  return json({ results });
}
__name(handleInternalSync, "handleInternalSync");

// src/worker/recover.ts
async function handleRecover(req, env) {
  const id = parseIdFromPath2(req.url);
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const status = await env.KV.get(`status:${id}`);
  if (status !== "recalled") {
    return json({ error: "package_not_recalled", status }, 400);
  }
  const replacementId = await env.KV.get(`replacement:${id}`);
  if (!replacementId) {
    return json({ error: "no_replacement_available", recalled_package_id: id }, 410);
  }
  const replacementVerify = await env.KV.get(`verify:${replacementId}`, "json");
  if (!replacementVerify) {
    return json({ error: "replacement_verification_missing", replacement_id: replacementId }, 500);
  }
  return json({
    recalled_package_id: id,
    replacement_package_id: replacementId,
    replacement_verification: replacementVerify,
    replacement_paid_url: `${env.OWNSITE_BASE}/buy/${replacementId}`,
    replacement_verify_url: `${env.OWNSITE_BASE}/verify/${replacementId}`,
    note: "Recovery is technical only. Agent must re-verify replacement signature before purchase."
  });
}
__name(handleRecover, "handleRecover");
function parseIdFromPath2(url) {
  const m = url.match(/\/recover\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
__name(parseIdFromPath2, "parseIdFromPath");

// src/worker/dashboard.ts
async function handleDashboard(env) {
  const days = Math.min(90, Math.max(1, parseInt(new URL(env.OWNSITE_BASE).searchParams.get("days") ?? "30", 10)));
  const dayAgo = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const [
    pkgsResult,
    paymentsResult,
    settleDaily,
    refetchResult,
    recallResult,
    verifyCount,
    buyCount,
    facilitatorDaily
  ] = await Promise.all([
    env.DB.prepare(
      "SELECT COUNT(*) as c FROM packages WHERE tier IN ('listed','featured') AND status='fresh'"
    ).first(),
    env.DB.prepare(
      `SELECT COUNT(*) as c, SUM(CAST(amount_usdc AS REAL))/1000000 as rev
       FROM payments WHERE called_at >= ? AND status='settled'`
    ).bind(dayAgo).first(),
    env.DB.prepare(
      `SELECT facilitator, settled, failed, total_amount_usdc, fallback_rate
       FROM settle_daily WHERE day >= ? ORDER BY day DESC`
    ).bind(dayAgo).all(),
    env.DB.prepare(
      `SELECT
         COUNT(*) as runs,
         SUM(CASE WHEN matched=1 THEN 1 ELSE 0 END) as ok,
         COUNT(DISTINCT package_id) as unique_pkgs
       FROM refetch_events WHERE sampled_at >= ?`
    ).bind(dayAgo).first(),
    env.DB.prepare(
      "SELECT COUNT(*) as c FROM recall_log WHERE decided_at >= ?"
    ).bind(dayAgo).first(),
    env.DB.prepare(
      "SELECT value FROM kpi_snapshot WHERE metric='verify_calls' AND day >= ? ORDER BY day DESC"
    ).bind(dayAgo).all(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM payments WHERE called_at >= ?`
    ).bind(dayAgo).first(),
    env.DB.prepare(
      `SELECT facilitator, SUM(healthy_hours) as healthy, SUM(total_hours) as total
       FROM facilitator_daily WHERE day >= ? GROUP BY facilitator`
    ).bind(dayAgo).all()
  ]);
  const verifySum = verifyCount.results.reduce((s, r) => s + (r.value || 0), 0);
  const buySuccess = paymentsResult?.c ?? 0;
  const buyAttempts = buyCount?.c ?? 0;
  const latencies = (await env.DB.prepare(
    "SELECT latency_ms FROM settle_attempts WHERE called_at >= ? AND latency_ms IS NOT NULL"
  ).bind(dayAgo).all()).results.map((r) => r.latency_ms).sort((a, b) => a - b);
  const latency = percentileStats(latencies);
  const facilitators = {};
  for (const f of facilitatorDaily.results) {
    facilitators[f.facilitator] = {
      healthy_hours: f.healthy ?? 0,
      total_hours: f.total ?? 0,
      uptime: (f.total ?? 0) > 0 ? (f.healthy ?? 0) / (f.total ?? 0) : 1
    };
  }
  const refetchTotal = refetchResult?.runs ?? 0;
  const refetchOk = refetchResult?.ok ?? 0;
  const body = {
    generated_at: nowIso,
    time_range_days: days,
    totals: {
      packages_listed: pkgsResult?.c ?? 0,
      packages_featured: (await env.DB.prepare(
        "SELECT COUNT(*) as c FROM packages WHERE tier='featured' AND status='fresh'"
      ).first())?.c ?? 0,
      packages_recalled_30d: recallResult?.c ?? 0,
      payments_30d: buySuccess,
      revenue_usdc_30d: Math.round((paymentsResult?.rev ?? 0) * 100) / 100,
      refetch_pass_rate: refetchTotal > 0 ? Math.round(refetchOk / refetchTotal * 1e4) / 1e4 : null
    },
    funnel: {
      verify_calls_30d: verifySum,
      buy_attempts_30d: buyAttempts,
      buy_successes_30d: buySuccess,
      verify_to_buy_rate: verifySum > 0 ? Math.round(buySuccess / verifySum * 1e4) / 1e4 : null,
      attempt_to_success_rate: buyAttempts > 0 ? Math.round(buySuccess / buyAttempts * 1e4) / 1e4 : null
    },
    latency,
    facilitators,
    settle_history: settleDaily.results.slice(0, 30),
    uptime: {
      refetch_runs_30d: refetchTotal,
      refetch_unique_packages: refetchResult?.unique_pkgs ?? 0
    },
    disclaimer: "Public aggregate metrics. No individual Agent or payer data exposed."
  };
  return json(body, 200, {
    "cache-control": "public, max-age=300"
  });
}
__name(handleDashboard, "handleDashboard");
function percentileStats(sorted) {
  if (sorted.length === 0)
    return { p50: null, p95: null, p99: null, count: 0 };
  const pct = /* @__PURE__ */ __name((p) => {
    const idx = Math.min(sorted.length - 1, Math.floor(p / 100 * sorted.length));
    return sorted[idx];
  }, "pct");
  return { p50: pct(50), p95: pct(95), p99: pct(99), count: sorted.length };
}
__name(percentileStats, "percentileStats");
async function handleDashboardSales(env, days) {
  const dayAgo = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const results = await env.DB.prepare(
    `SELECT package_id, amount_usdc, called_at, status, agent_pseudonym, tx_hash
     FROM payments WHERE called_at >= ? ORDER BY called_at DESC LIMIT 50`
  ).bind(dayAgo).all();
  return json(results.results ?? []);
}
__name(handleDashboardSales, "handleDashboardSales");

// src/worker/reverify-push.ts
async function handleReverifyPush(req, env) {
  if (req.method !== "POST")
    return json({ error: "method_not_allowed" }, 405);
  const secret = req.headers.get("x-reverify-secret");
  if (!secret || !env.REVERIFY_SECRET || secret !== env.REVERIFY_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }
  const id = parseIdFromPath3(req.url);
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (!body.verification_json)
    return json({ error: "missing_verification_json" }, 400);
  await env.KV.put(`verify:${id}`, JSON.stringify(body.verification_json));
  await env.DB.prepare(
    `UPDATE packages SET q=?, verified_at=?, expires_at=?, status='fresh', updated_at=? WHERE package_id=?`
  ).bind(
    body.verification_json?.q ?? 0,
    body.verification_json?.verified_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    body.verification_json?.expires_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    (/* @__PURE__ */ new Date()).toISOString(),
    id
  ).run();
  await env.KV.put(`status:${id}`, "fresh");
  return json({ ok: true, package_id: id, pushed_at: (/* @__PURE__ */ new Date()).toISOString() });
}
__name(handleReverifyPush, "handleReverifyPush");
function parseIdFromPath3(url) {
  const m = url.match(/\/reverify\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
__name(parseIdFromPath3, "parseIdFromPath");

// src/worker/unrecall.ts
async function handleUnrecall(req, env) {
  if (req.method !== "POST")
    return json({ error: "method_not_allowed" }, 405);
  const key = req.headers.get("x-sync-key");
  if (!key || !env.SYNC_SIGNING_KEY || key !== env.SYNC_SIGNING_KEY) {
    return json({ error: "unauthorized" }, 401);
  }
  const id = parseIdFromPath4(req.url);
  if (!id)
    return json({ error: "invalid_package_id" }, 400);
  const status = await env.KV.get(`status:${id}`);
  if (status !== "recalled") {
    return json({ error: "not_recalled", current_status: status }, 400);
  }
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  if (body.new_q != null || body.new_expires_at != null) {
    await env.DB.prepare(
      `UPDATE packages SET status='fresh', held_since=NULL, held_days=0,
        q=?, expires_at=?, verified_at=?, updated_at=?
       WHERE package_id=?`
    ).bind(
      body.new_q ?? null,
      body.new_expires_at ?? null,
      body.new_verified_at ?? nowIso,
      nowIso,
      id
    ).run();
    const curVerify = await env.KV.get(`verify:${id}`, "json");
    if (curVerify) {
      await env.KV.put(`verify:${id}`, JSON.stringify({
        ...curVerify,
        ...body.new_q != null ? { q: body.new_q } : {},
        ...body.new_expires_at ? { expires_at: body.new_expires_at } : {},
        ...body.new_verified_at ? { verified_at: body.new_verified_at } : {}
      }));
    }
  } else {
    await env.DB.prepare(
      "UPDATE packages SET status='fresh', held_since=NULL, held_days=0, updated_at=? WHERE package_id=?"
    ).bind(nowIso, id).run();
  }
  await env.KV.put(`status:${id}`, "fresh");
  await env.KV.delete(`replacement:${id}`);
  await env.DB.prepare(
    `UPDATE recall_log SET unrecall_at=?, unrecall_by=?
     WHERE package_id=? AND unrecall_at IS NULL`
  ).bind(nowIso, body.reason ?? "manual-unrecall", id).run();
  return json({
    ok: true,
    package_id: id,
    new_status: "fresh",
    unrecall_reason: body.reason ?? "manual-unrecall",
    unrecall_at: nowIso
  });
}
__name(handleUnrecall, "handleUnrecall");
function parseIdFromPath4(url) {
  const m = url.match(/\/internal\/unrecall\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
__name(parseIdFromPath4, "parseIdFromPath");

// src/worker/agent-index.ts
init_sha256();

// src/worker/agent-index-query.ts
async function queryIndexRows(env, opts = {}) {
  const now = /* @__PURE__ */ new Date();
  const clauses = ["p.status='fresh'"];
  const params = [];
  if (opts.tier && opts.tier !== "all") {
    clauses.push("p.tier = ?");
    params.push(opts.tier);
  }
  if (opts.minQ != null) {
    clauses.push("p.q >= ?");
    params.push(opts.minQ);
  }
  if (opts.minEvidence != null) {
    clauses.push("p.evidence_count >= ?");
    params.push(opts.minEvidence);
  }
  clauses.push("p.expires_at > ?");
  params.push(now.toISOString());
  if (opts.keyword) {
    clauses.push("p.title LIKE ?");
    params.push(`%${opts.keyword}%`);
  }
  const { results } = await env.DB.prepare(
    `SELECT * FROM packages p WHERE ${clauses.join(" AND ")} ORDER BY p.q DESC, p.verified_at DESC`
  ).bind(...params).all();
  const packages = results.map((row) => toIndexEntry(row, env.OWNSITE_BASE));
  return {
    spec_version: "1.1",
    generated_at: now.toISOString(),
    packages
  };
}
__name(queryIndexRows, "queryIndexRows");
function toIndexEntry(row, base2) {
  const decay = Math.max(0.7, 1 - (Date.now() - new Date(row.verified_at).getTime()) / (180 * 864e5));
  const qEffective = Math.round(row.q * decay * 100) / 100;
  return {
    package_id: row.package_id,
    title: row.title,
    q: row.q,
    q_effective: qEffective,
    evidence_count: row.evidence_count,
    source_diversity: row.source_diversity ?? 0,
    verified_at: row.verified_at,
    expires_at: row.expires_at,
    tier: row.tier,
    origin: row.origin ?? "publisher",
    preview_url: `${base2}/preview/${row.package_id}`,
    verify_url: `${base2}/verify/${row.package_id}`,
    paid_url: `${base2}/buy/${row.package_id}`,
    price_usdc: row.tier === "featured" ? "1.00" : "0.50",
    status: "fresh"
  };
}
__name(toIndexEntry, "toIndexEntry");

// src/worker/cursor.ts
init_sha256();
init_hmac();
var CURSOR_TTL_MS = 6 * 3600 * 1e3;
function encodeCursor(secret, payload) {
  const body = JSON.stringify({ ...payload, exp: payload.exp ?? Date.now() + CURSOR_TTL_MS });
  const bodyB64 = btoa(body).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (!secret)
    return `${bodyB64}.unsigned`;
  const mac = hmac(sha2562, new TextEncoder().encode(secret), new TextEncoder().encode(bodyB64));
  const macB64 = btoa(String.fromCharCode(...Array.from(mac))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${bodyB64}.${macB64}`;
}
__name(encodeCursor, "encodeCursor");
function decodeCursor(raw, secret) {
  if (!raw)
    return null;
  const [bodyB64, macB64] = raw.split(".");
  if (!bodyB64 || !macB64)
    return null;
  if (macB64 === "unsigned" && !secret) {
  } else if (secret) {
    const expected = hmac(sha2562, new TextEncoder().encode(secret), new TextEncoder().encode(bodyB64));
    const expectedB64 = btoa(String.fromCharCode(...expected)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (expectedB64 !== macB64)
      return null;
  } else {
    return null;
  }
  try {
    const body = JSON.parse(atob(bodyB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (body.exp && body.exp < Date.now())
      return null;
    return body;
  } catch {
    return null;
  }
}
__name(decodeCursor, "decodeCursor");

// src/worker/agent-index.ts
var DEFAULT_LIMIT = 50;
var MAX_LIMIT = 200;
async function handleAgentIndexQuery(req, env) {
  const url = new URL(req.url);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)));
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const page = Math.floor(offset / limit) + 1;
  const cursorRaw = url.searchParams.get("cursor");
  if (cursorRaw) {
    const decoded = decodeCursor(cursorRaw, env.CURSOR_SECRET);
    if (!decoded)
      return json({ error: "bad_cursor" }, 400);
  }
  const opts = {
    minQ: parseFloatOrUndefined(url.searchParams.get("min_q")),
    minEvidence: parseIntOrUndefined(url.searchParams.get("min_evidence")),
    maxAgeDays: parseIntOrUndefined(url.searchParams.get("max_age_days")),
    tier: url.searchParams.get("tier") ?? "all",
    keyword: url.searchParams.get("keyword") ?? void 0
  };
  const index2 = await queryIndexRows(env, opts);
  const total = index2.packages.length;
  const pageStart = offset;
  const pageEnd = Math.min(offset + limit, total);
  const pageItems = index2.packages.slice(pageStart, pageEnd);
  const hasMore = pageEnd < total;
  const nextCursor = hasMore ? encodeCursor(
    env.CURSOR_SECRET,
    { offset: pageEnd, limit, generated_at: index2.generated_at, exp: Date.now() + 6 * 3600 * 1e3 }
  ) : null;
  const canonicalPayload = JSON.stringify({
    generated_at: index2.generated_at,
    page,
    limit,
    package_ids: pageItems.map((p) => p.package_id)
  });
  const etag = `W/"${hash256hex(canonicalPayload)}"`;
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        etag,
        "cache-control": `public, max-age=${env.AGENT_INDEX_CACHE_TTL || 300}`,
        vary: "accept-encoding, cursor, if-none-match"
      }
    });
  }
  const cacheTtl = parseInt(env.AGENT_INDEX_CACHE_TTL || "300", 10);
  const body = {
    spec_version: "1.1",
    generated_at: index2.generated_at,
    page,
    limit,
    total,
    next_cursor: nextCursor,
    packages: pageItems
  };
  return json(body, 200, {
    etag,
    "cache-control": `public, max-age=${cacheTtl}`,
    vary: "accept-encoding, cursor, if-none-match"
  });
}
__name(handleAgentIndexQuery, "handleAgentIndexQuery");
function parseFloatOrUndefined(s) {
  if (!s)
    return void 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : void 0;
}
__name(parseFloatOrUndefined, "parseFloatOrUndefined");
function parseIntOrUndefined(s) {
  if (!s)
    return void 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : void 0;
}
__name(parseIntOrUndefined, "parseIntOrUndefined");
function hash256hex(s) {
  const bytes = new TextEncoder().encode(s);
  return Array.from(sha2562(bytes)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hash256hex, "hash256hex");

// src/worker/a2a-metrics.ts
async function handleA2AMetrics(req, env) {
  const networkTag = env.NETWORK;
  if (!networkTag)
    throw new Error("NETWORK env missing \u2014 fail-closed");
  const url = new URL(req.url);
  const filterNetwork = url.searchParams.get("network") ?? null;
  const hasFilter = filterNetwork !== null && filterNetwork !== "";
  const queryNetwork = hasFilter ? filterNetwork : networkTag;
  let rows = [];
  let dailyTrend = [];
  let topPackages = [];
  try {
    const allResult = await env.DB.prepare(
      `SELECT facilitator, result, amount_usdc, payer, called_at, package_id, error, network
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND network = ?
       ORDER BY called_at DESC`
    ).bind(queryNetwork).all();
    rows = allResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] allQuery error:", e);
  }
  try {
    const dailyResult = await env.DB.prepare(
      `SELECT substr(called_at, 1, 10) as day,
              COUNT(*) as count,
              SUM(CAST(amount_usdc AS REAL)) / 1000000 as amount_usdc
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND result = 'settled'
         AND network = ?
       GROUP BY day
       ORDER BY day DESC
       LIMIT 30`
    ).bind(queryNetwork).all();
    dailyTrend = dailyResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] dailyQuery error:", e);
  }
  try {
    const pkgResult = await env.DB.prepare(
      `SELECT package_id,
              COUNT(DISTINCT payer) as payers,
              SUM(CAST(amount_usdc AS REAL)) / 1000000 as total_amount_usdc
       FROM settle_attempts
       WHERE result = 'settled'
         AND amount_usdc IS NOT NULL
         AND network = ?
       GROUP BY package_id
       ORDER BY total_amount_usdc DESC
       LIMIT 10`
    ).bind(queryNetwork).all();
    topPackages = pkgResult.results ?? [];
  } catch (e) {
    console.error("[a2a-metrics] pkgQuery error:", e);
  }
  const settled = rows.filter((r) => r.result === "settled");
  const failed = rows.filter((r) => r.result !== "settled" && r.result !== "");
  const totalAmount = settled.reduce((s, r) => s + (r.amount_usdc ? parseFloat(r.amount_usdc) / 1e6 : 0), 0);
  const uniquePayers = new Set(settled.map((r) => r.payer).filter(Boolean)).size;
  const payerCounts = {};
  for (const r of settled) {
    if (r.payer)
      payerCounts[r.payer] = (payerCounts[r.payer] ?? 0) + 1;
  }
  const repeatBuyers = Object.values(payerCounts).filter((c) => c >= 2).length;
  const repeatBuyerRate = uniquePayers > 0 ? Math.round(repeatBuyers / uniquePayers * 100) : 0;
  const humanIntervened = failed.filter((r) => r.error && r.error.length > 0).length;
  const byFacilitator = {};
  for (const r of settled) {
    const key = r.facilitator ?? "unknown";
    if (!byFacilitator[key])
      byFacilitator[key] = { count: 0, amount_usdc: 0, unique_payers: 0 };
    byFacilitator[key].count++;
    byFacilitator[key].amount_usdc += r.amount_usdc ? parseFloat(r.amount_usdc) / 1e6 : 0;
  }
  const facPayers = {};
  for (const r of settled) {
    const key = r.facilitator ?? "unknown";
    if (!facPayers[key])
      facPayers[key] = /* @__PURE__ */ new Set();
    if (r.payer)
      facPayers[key].add(r.payer);
  }
  for (const key of Object.keys(byFacilitator)) {
    const f = byFacilitator[key];
    if (f)
      f.unique_payers = facPayers[key]?.size ?? 0;
  }
  const dailyTrendOut = (dailyTrend ?? []).map((r) => ({
    day: r.day,
    count: r.count,
    amount_usdc: Math.round(r.amount_usdc * 1e4) / 1e4
  })).reverse();
  let byNetworkBreakdown = {};
  try {
    const grpResult = await env.DB.prepare(
      `SELECT network, result,
              COUNT(*) as cnt,
              SUM(CASE WHEN result = 'settled' THEN CAST(amount_usdc AS REAL) ELSE 0 END) / 1000000 as usdc
       FROM settle_attempts
       WHERE called_at >= datetime('now', '-90 days')
         AND network = ?
       GROUP BY network, result`
    ).bind(queryNetwork).all();
    const grpRows = grpResult.results ?? [];
    for (const r of grpRows) {
      if (!byNetworkBreakdown[r.network])
        byNetworkBreakdown[r.network] = { settled: 0, failed: 0, amount_usdc: 0 };
      const netEntry = byNetworkBreakdown[r.network];
      if (r.result === "settled") {
        netEntry.settled += r.cnt;
        netEntry.amount_usdc += r.usdc;
      } else if (r.result !== "") {
        netEntry.failed += r.cnt;
      }
    }
  } catch (e) {
    console.error("[a2a-metrics] byNetworkQuery error:", e);
  }
  const effectiveNetwork = hasFilter ? queryNetwork : "all";
  const dataSourceLabel = hasFilter ? `D1 ownsite-aeo (${queryNetwork} settled)` : `D1 ownsite-aeo (all networks settled, default NETWORK=${networkTag})`;
  const response = {
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    network: effectiveNetwork,
    data_source: dataSourceLabel,
    totals: {
      settled_count: settled.length,
      failed_count: failed.length,
      total_amount_usdc: Math.round(totalAmount * 1e4) / 1e4,
      avg_amount_usdc: settled.length > 0 ? Math.round(totalAmount / settled.length * 1e4) / 1e4 : 0,
      unique_payers: uniquePayers,
      repeat_buyer_rate_pct: repeatBuyerRate,
      human_intervention_count: humanIntervened
    },
    by_facilitator: byFacilitator,
    by_network: byNetworkBreakdown,
    daily_trend: dailyTrendOut,
    top_packages: (topPackages ?? []).map((r) => ({
      package_id: r.package_id,
      payers: r.payers,
      total_amount_usdc: Math.round(r.total_amount_usdc * 1e4) / 1e4
    }))
  };
  return json(response);
}
__name(handleA2AMetrics, "handleA2AMetrics");

// src/worker/sync-cron.ts
async function pushToTarget(env, row) {
  switch (row.target) {
    case "bazaar":
    case "agent402":
    case "mcp_so":
    case "datapoint":
      return;
    case "internal":
      void row.package_id;
      void row.action;
      return;
    default:
      throw new Error(`unknown_target:${row.target}`);
  }
}
__name(pushToTarget, "pushToTarget");

// src/worker/recall-package.ts
async function recallPackage(env, packageId, opts) {
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      "UPDATE packages SET status='recalled', updated_at=? WHERE package_id=?"
    ).bind(nowIso, packageId).run();
    await env.KV.put(`status:${packageId}`, "recalled");
    if (opts.replacementPackageId) {
      await env.KV.put(`replacement:${packageId}`, opts.replacementPackageId);
    }
    await env.DB.prepare(
      `INSERT INTO recall_log (package_id, reason, replacement_package_id, decided_at, decided_by)
       VALUES (?,?,?,?,?)`
    ).bind(
      packageId,
      opts.reason,
      opts.replacementPackageId ?? null,
      nowIso,
      opts.decidedBy ?? "cron"
    ).run();
    await env.DB.prepare(
      `INSERT OR IGNORE INTO sync_queue (id, package_id, target, action, created_at)
       VALUES (?, 'bazaar', 'unpublish', ?)
       UNION ALL SELECT ?, 'agent402', 'unpublish', ?
       UNION ALL SELECT ?, 'mcp_so', 'unpublish', ?
       UNION ALL SELECT ?, 'datapoint', 'unpublish', ?`
    ).bind(
      `${packageId}:bazaar:recall`,
      packageId,
      packageId,
      nowIso,
      `${packageId}:agent402:recall`,
      packageId,
      `${packageId}:mcp_so:recall`,
      `${packageId}:datapoint:recall`
    ).run();
    return true;
  } catch (e) {
    console.error("recallPackage failed:", e);
    return false;
  }
}
__name(recallPackage, "recallPackage");

// src/worker/cron-ttl.ts
async function runTtlCron(env) {
  const stats = {
    scanned: 0,
    marked_stale: 0,
    marked_held: 0,
    auto_recalled: 0,
    skipped: 0
  };
  const STALE_WARNING_HOURS = parseInt(env.STALE_WARNING_HOURS || "72", 10);
  const HELD_MAX_DAYS = parseInt(env.HELD_MAX_DAYS || "14", 10);
  const now = Date.now();
  const warningBoundary = now + STALE_WARNING_HOURS * 36e5;
  const { results } = await env.DB.prepare(
    "SELECT * FROM packages WHERE status IN ('fresh','stale') ORDER BY expires_at ASC"
  ).all();
  for (const pkg of results) {
    stats.scanned += 1;
    const expiresAt = new Date(pkg.expires_at).getTime();
    const nowIso = new Date(now).toISOString();
    if (pkg.status === "fresh" && expiresAt <= now) {
      await env.DB.prepare(
        "UPDATE packages SET status='stale', held_since=?, updated_at=? WHERE package_id=?"
      ).bind(nowIso, nowIso, pkg.package_id).run();
      await env.KV.put(`status:${pkg.package_id}`, "stale");
      stats.marked_stale += 1;
      continue;
    }
    if (pkg.status === "fresh" && expiresAt <= warningBoundary && !pkg.held_since) {
      await env.DB.prepare(
        "UPDATE packages SET held_since=?, updated_at=? WHERE package_id=?"
      ).bind(nowIso, nowIso, pkg.package_id).run();
      stats.marked_held += 1;
      continue;
    }
    if (pkg.status === "stale" && pkg.held_days >= HELD_MAX_DAYS) {
      const ok = await recallPackage(env, pkg.package_id, {
        reason: `auto_recall_held_${pkg.held_days}d`,
        decidedBy: "cron-ttl"
      });
      if (ok)
        stats.auto_recalled += 1;
      else
        stats.skipped += 1;
    }
  }
  return stats;
}
__name(runTtlCron, "runTtlCron");

// src/worker/cron-refetch.ts
init_sha256();
async function runRefetchScan(env) {
  const runId = `refetch-${Date.now()}`;
  const sampleRate = parseFloat(env.REFETCH_SAMPLE_RATE || "0.20");
  const consecutiveFails = parseInt(env.REFETCH_CONSECUTIVE_FAILS || "2", 10);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const stats = {
    run_id: runId,
    sampled_packages: 0,
    sampled_evidence: 0,
    matched: 0,
    mismatched: 0,
    network_errors: 0,
    not_found: 0,
    content_changed: 0,
    recalls_triggered: 0
  };
  const { results: activePkgs } = await env.DB.prepare(
    `SELECT package_id FROM packages WHERE status IN ('fresh','stale') ORDER BY RANDOM()`
  ).all();
  const sampleSize = Math.max(1, Math.ceil(activePkgs.length * sampleRate));
  const sampledPkgs = activePkgs.slice(0, sampleSize);
  stats.sampled_packages = sampledPkgs.length;
  for (const { package_id: pkgId } of sampledPkgs) {
    const verifyRaw = await env.KV.get(`verify:${pkgId}`);
    if (!verifyRaw)
      continue;
    let verification;
    try {
      verification = JSON.parse(verifyRaw);
    } catch {
      continue;
    }
    if (!verification.evidence?.length)
      continue;
    let consecutiveFailsLocal = 0;
    for (const ev of verification.evidence.slice(0, 5)) {
      stats.sampled_evidence += 1;
      const t0 = Date.now();
      const result = await refetchAndCompare(ev.source_url, ev.excerpt_hash);
      const latency = Date.now() - t0;
      await env.DB.prepare(
        `INSERT INTO refetch_events
         (package_id, evidence_id, source_url, excerpt_hash, matched, refetch_status, latency_ms, sampled_at, run_id)
         VALUES (?,?,?,?,?,?,?,?,?)`
      ).bind(
        pkgId,
        ev.evidence_id,
        ev.source_url,
        ev.excerpt_hash,
        result.matched ? 1 : 0,
        result.status,
        latency,
        nowIso,
        runId
      ).run();
      if (result.matched) {
        stats.matched += 1;
      } else if (result.status === "network_error") {
        stats.network_errors += 1;
      } else if (result.status === "not_found") {
        stats.not_found += 1;
      } else if (result.status === "content_changed") {
        stats.content_changed += 1;
        consecutiveFailsLocal += 1;
      } else {
        stats.mismatched += 1;
      }
    }
    if (consecutiveFailsLocal >= consecutiveFails) {
      const ok = await recallPackage(env, pkgId, {
        reason: `refetch_hash_mismatch_${consecutiveFailsLocal}/${consecutiveFails}`,
        decidedBy: "cron-refetch"
      });
      if (ok)
        stats.recalls_triggered += 1;
    }
  }
  return stats;
}
__name(runRefetchScan, "runRefetchScan");
async function refetchAndCompare(sourceUrl, expectedHash) {
  try {
    const resp = await fetch(sourceUrl, {
      headers: { "user-agent": "ownsite-aeo-refetch-bot/1.5" },
      redirect: "follow"
    });
    if (!resp.ok) {
      if (resp.status === 404)
        return { matched: false, status: "not_found" };
      return { matched: false, status: "network_error" };
    }
    const text = await resp.text();
    const pageHash = "sha256:" + Array.from(sha2562(new TextEncoder().encode(text))).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (pageHash === expectedHash)
      return { matched: true, status: "ok" };
    return { matched: false, status: "content_changed" };
  } catch {
    return { matched: false, status: "network_error" };
  }
}
__name(refetchAndCompare, "refetchAndCompare");

// src/worker/cron-dashboard.ts
async function runDashboardCron(env) {
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const stats = { day: yesterday, metrics_written: 0 };
  const yesterdayStart = new Date(yesterday).toISOString();
  const yesterdayEnd = today;
  const [
    verifyCount,
    buySuccess,
    buyFailed,
    refetchOk,
    refetchTotal,
    settleOk,
    settleFail,
    listCount,
    featuredCount,
    heldCount
  ] = await Promise.all([
    countKpi(env, "verify_calls", yesterday),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM payments
       WHERE called_at >= ? AND called_at < ? AND status='settled'`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result != 'settled'`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare(
      `SELECT SUM(CASE WHEN matched=1 THEN 1 ELSE 0 END) as ok
       FROM refetch_events WHERE sampled_at >= ? AND sampled_at < ?`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM refetch_events
       WHERE sampled_at >= ? AND sampled_at < ?`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result='settled'`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare(
      `SELECT COUNT(*) as c FROM settle_attempts
       WHERE called_at >= ? AND called_at < ? AND result != 'settled'`
    ).bind(yesterdayStart, yesterdayEnd).first(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE tier='listed'").first(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE tier='featured'").first(),
    env.DB.prepare("SELECT COUNT(*) as c FROM packages WHERE held_since IS NOT NULL").first()
  ]);
  const metrics = [
    ["verify_calls", verifyCount],
    ["buy_successes", buySuccess?.c ?? 0],
    ["buy_failed", buyFailed?.c ?? 0],
    ["refetch_ok", refetchOk?.ok ?? 0],
    ["refetch_total", refetchTotal?.c ?? 0],
    ["settle_ok", settleOk?.c ?? 0],
    ["settle_fail", settleFail?.c ?? 0],
    ["packages_listed_total", listCount?.c ?? 0],
    ["packages_featured_total", featuredCount?.c ?? 0],
    ["packages_held", heldCount?.c ?? 0]
  ];
  if (refetchTotal?.c) {
    metrics.push([
      "refetch_pass_rate",
      Math.round((refetchOk?.ok ?? 0) / refetchTotal.c * 1e4) / 1e4
    ]);
  }
  if ((settleOk?.c ?? 0) + (settleFail?.c ?? 0) > 0) {
    metrics.push([
      "settle_success_rate",
      Math.round((settleOk?.c ?? 0) / ((settleOk?.c ?? 0) + (settleFail?.c ?? 0)) * 1e4) / 1e4
    ]);
  }
  for (const [metric, value] of metrics) {
    await env.DB.prepare(
      "INSERT INTO kpi_snapshot (day, metric, value) VALUES (?, ?, ?)"
    ).bind(yesterday, metric, value).run();
    stats.metrics_written += 1;
  }
  return stats;
}
__name(runDashboardCron, "runDashboardCron");
async function countKpi(env, metric, day) {
  const { results } = await env.DB.prepare(
    "SELECT value FROM kpi_snapshot WHERE day=? AND metric=? ORDER BY created_at DESC LIMIT 1"
  ).bind(day, metric).all();
  return results[0]?.value ?? 0;
}
__name(countKpi, "countKpi");

// src/worker/reverify-client.ts
async function callVerifierForReverify(env, packageId, current) {
  if (!env.VERIFIER_ENDPOINT)
    return { ok: false, reason: "no_verifier_endpoint" };
  if (!env.REVERIFY_SECRET)
    return { ok: false, reason: "no_reverify_secret" };
  try {
    const r = await fetch(`${env.VERIFIER_ENDPOINT.replace(/\/$/, "")}/reverify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-reverify-secret": env.REVERIFY_SECRET
      },
      body: JSON.stringify({
        package_id: packageId,
        current_q: current.q,
        current_verified_at: current.verified_at,
        current_expires_at: current.expires_at
      }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!r.ok) {
      return { ok: false, reason: `http_${r.status}` };
    }
    const body = await r.json();
    return {
      ok: true,
      newVerification: body.verification_json,
      oldQ: current.q,
      newQ: body.new_q,
      newVerifiedAt: body.new_verified_at,
      newExpiresAt: body.new_expires_at,
      reason: body.reason
    };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "verifier_error"
    };
  }
}
__name(callVerifierForReverify, "callVerifierForReverify");

// src/worker/cron-reverify.ts
async function runReverifyCron(env) {
  const stats = {
    scanned: 0,
    leased: 0,
    success: 0,
    low_q: 0,
    no_change: 0,
    verifier_error: 0,
    timed_out: 0,
    now_recalled: 0
  };
  const leaseHours = parseInt(env.REVERIFY_LEASE_HOURS || "24", 10);
  const now = Date.now();
  const warningBoundary = now + 72 * 36e5;
  const workerId = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { results } = await env.DB.prepare(
    `SELECT p.*,
            (SELECT leased_until FROM reverify_leases WHERE package_id=p.package_id) as lease_until
     FROM packages p
     WHERE p.status IN ('fresh','stale')
       AND p.expires_at <= ?
     ORDER BY p.expires_at ASC
     LIMIT 20`
  ).bind(new Date(warningBoundary).toISOString()).all();
  for (const pkg of results) {
    stats.scanned += 1;
    if (pkg.lease_until && new Date(pkg.lease_until).getTime() > now) {
      continue;
    }
    await env.DB.prepare(
      `INSERT INTO reverify_leases (package_id, leased_by, leased_until, attempt)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(package_id) DO UPDATE SET leased_until=excluded.leased_until, leased_by=excluded.leased_by`
    ).bind(
      pkg.package_id,
      workerId,
      new Date(now + leaseHours * 36e5).toISOString()
    ).run().catch(() => {
    });
    stats.leased += 1;
    const t0 = Date.now();
    const result = await callVerifierForReverify(env, pkg.package_id, {
      q: pkg.q,
      verified_at: pkg.verified_at,
      expires_at: pkg.expires_at
    });
    const finishedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (!result.ok) {
      if (result.reason?.includes("timeout"))
        stats.timed_out += 1;
      else
        stats.verifier_error += 1;
      await recordAttempt(env, pkg.package_id, "verifier_error", pkg.q, null, null, null, `reason=${result.reason}`, t0, finishedAt);
      continue;
    }
    if ((result.newQ ?? pkg.q) < RECALL_Q_THRESHOLD) {
      await recallPackage(env, pkg.package_id, {
        reason: `reverify_low_q_${result.newQ}`,
        decidedBy: "cron-reverify"
      });
      stats.now_recalled += 1;
      await recordAttempt(env, pkg.package_id, "low_q", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "below_threshold", t0, finishedAt);
      continue;
    }
    if (result.newQ === pkg.q && result.newExpiresAt === pkg.expires_at) {
      await recordAttempt(env, pkg.package_id, "no_change", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "same_values", t0, finishedAt);
      stats.no_change += 1;
      continue;
    }
    if (result.newVerification) {
      await env.KV.put(`verify:${pkg.package_id}`, JSON.stringify(result.newVerification));
      await env.DB.prepare(
        "UPDATE packages SET q=?, verified_at=?, expires_at=?, status='fresh', held_since=NULL, held_days=0, updated_at=? WHERE package_id=?"
      ).bind(
        result.newQ ?? pkg.q,
        result.newVerifiedAt ?? pkg.verified_at,
        result.newExpiresAt ?? pkg.expires_at,
        finishedAt,
        pkg.package_id
      ).run();
      await env.KV.put(`status:${pkg.package_id}`, "fresh");
      if (pkg.status === "recalled") {
        await env.DB.prepare(
          "UPDATE recall_log SET unrecall_at=?, unrecall_by=? WHERE package_id=? AND unrecall_at IS NULL"
        ).bind(finishedAt, "cron-reverify", pkg.package_id).run();
      }
      stats.success += 1;
    } else {
      await recordAttempt(env, pkg.package_id, "no_change", pkg.q, result.newQ ?? null, result.newVerifiedAt ?? null, result.newExpiresAt ?? null, "no_verification_json", t0, finishedAt);
      stats.no_change += 1;
    }
    await env.DB.prepare("DELETE FROM reverify_leases WHERE package_id=?").bind(pkg.package_id).run();
  }
  return stats;
}
__name(runReverifyCron, "runReverifyCron");
async function recordAttempt(env, pkgId, result, oldQ, newQ, newVerifiedAt, newExpiresAt, detail, startMs, finishedAt) {
  await env.DB.prepare(
    `INSERT INTO reverify_attempts (package_id, attempt, result, old_q, new_q, new_verified_at, new_expires_at, detail, started_at, finished_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(pkgId, 1, result, oldQ, newQ, newVerifiedAt, newExpiresAt, detail, new Date(startMs).toISOString(), finishedAt).run();
}
__name(recordAttempt, "recordAttempt");

// src/worker/cron-settle.ts
async function runSettleCron(env) {
  const now = /* @__PURE__ */ new Date();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);
  hourStart.setUTCHours(hourStart.getUTCHours() - 1);
  const hourEnd = new Date(hourStart.getTime() + 36e5);
  const { results } = await env.DB.prepare(
    `SELECT facilitator, result, latency_ms, amount_usdc
     FROM settle_attempts
     WHERE called_at >= ? AND called_at < ?`
  ).bind(
    hourStart.toISOString(),
    hourEnd.toISOString()
  ).all();
  const byFacilitator = {};
  for (const r of results) {
    if (!byFacilitator[r.facilitator]) {
      byFacilitator[r.facilitator] = { settled: 0, failed: 0, latencies: [], totalAmount: 0 };
    }
    const f = byFacilitator[r.facilitator];
    if (r.result === "settled") {
      f.settled += 1;
      f.totalAmount += parseInt(r.amount_usdc ?? "0", 10);
    } else {
      f.failed += 1;
    }
    if (r.latency_ms)
      f.latencies.push(r.latency_ms);
  }
  let rows = 0;
  const hourKey = hourStart.toISOString().slice(0, 13) + ":00:00Z";
  for (const [facilitator, agg] of Object.entries(byFacilitator)) {
    const sorted = agg.latencies.sort((a, b) => a - b);
    const avg = sorted.length > 0 ? Math.round(sorted.reduce((s, x) => s + x, 0) / sorted.length) : null;
    const p95 = sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : null;
    await env.DB.prepare(
      `INSERT INTO settle_hourly (hour, facilitator, settled, failed, total_amount_usdc, avg_latency_ms, p95_latency_ms)
       VALUES (?,?,?,?,?,?,?)
       ON CONFLICT(hour, facilitator) DO UPDATE SET
         settled=excluded.settled, failed=excluded.failed,
         total_amount_usdc=excluded.total_amount_usdc,
         avg_latency_ms=excluded.avg_latency_ms, p95_latency_ms=excluded.p95_latency_ms`
    ).bind(hourKey, facilitator, agg.settled, agg.failed, String(agg.totalAmount), avg, p95).run();
    rows += 1;
  }
  if (now.getUTCHours() === 9) {
    await aggregateDaily(env);
  }
  return { hour: hourKey, rows };
}
__name(runSettleCron, "runSettleCron");
async function aggregateDaily(env) {
  const day = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const dayStart = new Date(day).toISOString();
  const dayEnd = new Date(new Date(dayStart).getTime() + 864e5).toISOString();
  const { results: settleRows } = await env.DB.prepare(
    `SELECT facilitator, result, amount_usdc
     FROM settle_attempts
     WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all();
  const totals = {};
  for (const r of settleRows) {
    if (!totals[r.facilitator])
      totals[r.facilitator] = { settled: 0, failed: 0, amount: 0 };
    const t = totals[r.facilitator];
    if (r.result === "settled") {
      t.settled += 1;
      t.amount += parseInt(r.amount_usdc ?? "0", 10);
    } else {
      t.failed += 1;
    }
  }
  const { results: pkgs } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT package_id) as c FROM payments WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all();
  const { results: agents } = await env.DB.prepare(
    `SELECT COUNT(DISTINCT agent_pseudonym) as c FROM payments WHERE called_at >= ? AND called_at < ?`
  ).bind(dayStart, dayEnd).all();
  for (const [facilitator, agg] of Object.entries(totals)) {
    const totalAll = Object.values(totals).reduce((s, x) => s + x.failed, 0);
    const fallbackRate = totalAll > 0 ? Math.round(agg.failed / totalAll * 1e4) / 1e4 : 0;
    await env.DB.prepare(
      `INSERT INTO settle_daily (day, facilitator, settled, failed, total_amount_usdc, unique_packages, unique_agents, fallback_rate)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(day, facilitator) DO UPDATE SET
         settled=excluded.settled, failed=excluded.failed,
         total_amount_usdc=excluded.total_amount_usdc,
         unique_packages=excluded.unique_packages,
         unique_agents=excluded.unique_agents,
         fallback_rate=excluded.fallback_rate`
    ).bind(day, facilitator, agg.settled, agg.failed, String(agg.amount), pkgs[0]?.c ?? 0, agents[0]?.c ?? 0, fallbackRate).run();
  }
}
__name(aggregateDaily, "aggregateDaily");

// src/worker/agent-index-snapshot.ts
async function runAgentIndexSnapshot(env) {
  const index2 = await queryIndexRows(env);
  const ttl = parseInt(env.AGENT_INDEX_CACHE_TTL || "300", 10);
  await env.KV.put("cache:agent-index:default", JSON.stringify(index2), {
    expirationTtl: ttl * 60
    // 5x 主 TTL 保證快取覆蓋
  });
  return {
    generated_at: index2.generated_at,
    packages: index2.packages.length,
    cache_ttl_seconds: ttl
  };
}
__name(runAgentIndexSnapshot, "runAgentIndexSnapshot");

// src/worker/cron-agent-index.ts
async function runAgentIndexCron(env) {
  return runAgentIndexSnapshot(env);
}
__name(runAgentIndexCron, "runAgentIndexCron");

// src/worker/cursor-audit.ts
async function runCursorAuditCron(env) {
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString();
  const result = await env.DB.prepare(
    "DELETE FROM cursor_audit WHERE created_at < ?"
  ).bind(cutoff).run();
  return { deleted: result.meta?.changes ?? 0, cutoff };
}
__name(runCursorAuditCron, "runCursorAuditCron");

// src/worker/cron-held-timeout.ts
async function runHeldTimeoutCron(env) {
  const HELD_MAX_DAYS = parseInt(env.HELD_MAX_DAYS || "14", 10);
  const stats = { scanned: 0, recalled: 0, skipped: 0 };
  const { results } = await env.DB.prepare(
    `SELECT package_id, held_since, held_days
     FROM packages
     WHERE status IN ('stale','fresh')
       AND held_since IS NOT NULL
       AND held_days >= ?`
  ).bind(HELD_MAX_DAYS).all();
  for (const row of results) {
    stats.scanned += 1;
    const ok = await recallPackage(env, row.package_id, {
      reason: `held_timeout_${row.held_days}d_since_${row.held_since.slice(0, 10)}`,
      decidedBy: "cron-held-timeout"
    });
    if (ok)
      stats.recalled += 1;
    else
      stats.skipped += 1;
  }
  return stats;
}
__name(runHeldTimeoutCron, "runHeldTimeoutCron");

// src/facilitator/health-cron.ts
async function runFacilitatorHealthCron(env) {
  const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const facEnv = {
    FACILITATOR_URL: env.FACILITATOR_URL,
    CDP_API_KEY: env.CDP_API_KEY,
    SELFHOSTED_PRIVATE_KEY: env.SELFHOSTED_PRIVATE_KEY,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC,
    OWNSITE_BASE: env.OWNSITE_BASE
  };
  const cdp2 = new CDPFacilitator();
  const selfhosted2 = new SelfHostedFacilitator();
  const results = await Promise.all([
    cdp2.healthCheck(facEnv),
    selfhosted2.healthCheck(facEnv)
  ]);
  const entries = [
    ["cdp", results[0]],
    ["selfhosted", results[1]]
  ];
  for (const [name, r] of entries) {
    await env.DB.prepare(
      `INSERT INTO facilitator_hourly (hour, facilitator, health, requests, circuit_state)
       VALUES (?,?,?,?,?)
       ON CONFLICT(hour, facilitator) DO UPDATE SET health=excluded.health`
    ).bind(
      (/* @__PURE__ */ new Date()).toISOString().slice(0, 13) + ":00:00Z",
      name,
      r.ok ? 1 : 0,
      1,
      r.ok ? "closed" : "open"
    ).run();
    await env.DB.prepare(
      `INSERT INTO facilitator_daily (day, facilitator, healthy_hours, total_hours)
       VALUES (?,?,?,?)
       ON CONFLICT(day, facilitator) DO UPDATE SET
         healthy_hours=healthy_hours+excluded.healthy_hours,
         total_hours=total_hours+excluded.total_hours`
    ).bind(day, name, r.ok ? 1 : 0, 1).run();
  }
  return { day, results: entries };
}
__name(runFacilitatorHealthCron, "runFacilitatorHealthCron");

// src/market/adapters/bazaar.ts
var BazaarAdapter = class {
  name = "bazaar";
  baseUrl = "https://api.cdp.coinbase.com/platform/v1";
  async healthCheck(env) {
    if (!env.MARKET_BAZAAR_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/x402/merchant/me`, {
        headers: { "cdp-api-key": env.MARKET_BAZAAR_API_KEY }
      });
      if (!r.ok)
        return { ok: false, error: `http_${r.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async publish(env, pkg) {
    if (!env.MARKET_BAZAAR_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/x402/merchandise`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cdp-api-key": env.MARKET_BAZAAR_API_KEY
        },
        body: JSON.stringify({
          resource: pkg.paid_url,
          description: `${pkg.title} \u2014 q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}, verified ${pkg.verified_at.slice(0, 10)}`,
          mimeType: "application/json",
          payTo: "0xPLACEHOLDER_PAY_TO",
          maxAmountRequired: pkg.price_usdc,
          network: env.NETWORK,
          asset: env.ASSET_USDC,
          maxTimeoutSeconds: 300
        })
      });
      if (!r.ok)
        return { ok: false, error: `http_${r.status}` };
      const body = await r.json();
      return { ok: true, external_id: body.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async unpublish(env, pkg) {
    if (!env.MARKET_BAZAAR_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: void 0 };
  }
};
__name(BazaarAdapter, "BazaarAdapter");

// src/market/adapters/agent402.ts
var Agent402Adapter = class {
  name = "agent402";
  baseUrl = "https://agent402.com/api";
  async healthCheck(env) {
    if (!env.MARKET_AGENT402_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/health`, {
        headers: { "authorization": `Bearer ${env.MARKET_AGENT402_API_KEY}` }
      });
      return r.ok ? { ok: true } : { ok: false, error: `http_${r.status}` };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async publish(env, pkg) {
    if (!env.MARKET_AGENT402_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/sell`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.MARKET_AGENT402_API_KEY}`
        },
        body: JSON.stringify({
          name: pkg.title,
          description: `verified data package: q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}`,
          endpoint: pkg.paid_url,
          price: pkg.price_usdc,
          tags: ["verified-data", "machine-verifiable", "x402", "research-data"]
        })
      });
      if (!r.ok)
        return { ok: false, error: `http_${r.status}` };
      const body = await r.json();
      return { ok: true, external_id: body.id ?? body.listing_id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async unpublish(env, pkg) {
    if (!env.MARKET_AGENT402_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: void 0 };
  }
};
__name(Agent402Adapter, "Agent402Adapter");

// src/market/adapters/mcpso.ts
var MCPSoAdapter = class {
  name = "mcp_so";
  baseUrl = "https://mcp.so/api";
  async healthCheck(env) {
    if (!env.MARKET_MCP_SO_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true };
  }
  async publish(env, pkg) {
    if (!env.MARKET_MCP_SO_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/tools`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.MARKET_MCP_SO_API_KEY}`
        },
        body: JSON.stringify({
          name: `verified_${pkg.package_id}`,
          description: `Machine-verified research: q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}. Call ${pkg.verify_url} for full verification.`,
          endpoint: pkg.paid_url,
          pricing: { type: "per_call", amount: pkg.price_usdc },
          tags: ["verified-data", "machine-verifiable"]
        })
      });
      if (!r.ok)
        return { ok: false, error: `http_${r.status}` };
      const body = await r.json();
      return { ok: true, external_id: body.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async unpublish(env, pkg) {
    if (!env.MARKET_MCP_SO_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: void 0 };
  }
};
__name(MCPSoAdapter, "MCPSoAdapter");

// src/market/adapters/datapoint.ts
var DataPointAdapter = class {
  name = "datapoint";
  baseUrl = "https://datapoint.market/api";
  async healthCheck(env) {
    if (!env.MARKET_DATAPPOINT_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true };
  }
  async publish(env, pkg) {
    if (!env.MARKET_DATAPPOINT_API_KEY)
      return { ok: false, error: "no_api_key" };
    try {
      const r = await fetch(`${this.baseUrl}/products`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.MARKET_DATAPPOINT_API_KEY
        },
        body: JSON.stringify({
          name: `${pkg.title} (micro-subset)`,
          description: `q=${pkg.q.toFixed(2)}, evidence=${pkg.evidence_count}. Full package: ${pkg.paid_url} at $0.50.`,
          endpoint: pkg.paid_url,
          price: "0.005",
          tags: ["verified-data", "research-data"]
        })
      });
      if (!r.ok)
        return { ok: false, error: `http_${r.status}` };
      const body = await r.json();
      return { ok: true, external_id: body.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "network" };
    }
  }
  async unpublish(env, pkg) {
    if (!env.MARKET_DATAPPOINT_API_KEY)
      return { ok: false, error: "no_api_key" };
    return { ok: true, external_id: void 0 };
  }
};
__name(DataPointAdapter, "DataPointAdapter");

// src/market/registry.ts
var MARKET_ADAPTERS = {
  bazaar: new BazaarAdapter(),
  agent402: new Agent402Adapter(),
  mcp_so: new MCPSoAdapter(),
  datapoint: new DataPointAdapter()
};

// src/market/retry.ts
var DEFAULT_RETRY = {
  maxAttempts: 3,
  baseDelayMs: 1e3,
  maxDelayMs: 3e4
};
async function withRetry2(fn, cfg = DEFAULT_RETRY) {
  let lastErr = "unknown";
  for (let i = 1; i <= cfg.maxAttempts; i++) {
    try {
      const result = await fn();
      return { ok: true, result, attempts: i };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "unknown_error";
      if (i === cfg.maxAttempts)
        break;
      await new Promise(
        (resolve) => setTimeout(resolve, Math.min(cfg.baseDelayMs * 2 ** (i - 1), cfg.maxDelayMs))
      );
    }
  }
  return { ok: false, error: lastErr, attempts: cfg.maxAttempts };
}
__name(withRetry2, "withRetry");

// src/market/sync.ts
async function runMarketSync(env) {
  const stats = { processed: 0, succeeded: 0, failed: 0, skipped: 0 };
  const queueTargets = ["bazaar", "agent402", "mcp_so", "datapoint"];
  const queueResult = await env.DB.prepare(
    `SELECT * FROM sync_queue
     WHERE status='pending' AND target IN ('bazaar','agent402','mcp_so','datapoint')
       AND attempts < 3
     ORDER BY created_at ASC LIMIT 30`
  ).all();
  for (const row of queueResult.results) {
    stats.processed += 1;
    const adapter = MARKET_ADAPTERS[row.target];
    if (!adapter) {
      await markFailed(env, row.id, row.target, `unknown_target:${row.target}`, row.attempts);
      stats.failed += 1;
      continue;
    }
    const pkg = await loadPackageForSync(env, row.package_id);
    if (!pkg) {
      await markSkipped(env, row.id, row.attempts);
      stats.skipped += 1;
      continue;
    }
    const marketEnv = extractMarketEnv(env);
    const action = row.action === "publish" ? "publish" : "unpublish";
    const result = await withRetry2(async () => {
      const r = action === "publish" ? await adapter.publish(marketEnv, pkg) : await adapter.unpublish(marketEnv, pkg);
      if (!r.ok)
        throw new Error(r.error ?? "sync_failed");
      return r;
    });
    if (result.ok && result.result) {
      await env.DB.prepare(
        `INSERT INTO marketplace_listings (package_id, target, external_id, price_usdc, status, last_sync_at, attempts)
         VALUES (?,?,?,?,?,?,?)
         ON CONFLICT DO NOTHING`
      ).bind(
        row.package_id,
        row.target,
        result.result.external_id ?? null,
        pkg.price_usdc,
        action === "publish" ? "live" : "removed",
        (/* @__PURE__ */ new Date()).toISOString(),
        row.attempts + 1
      ).run();
      await env.DB.prepare(
        "UPDATE sync_queue SET status='done', attempts=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, (/* @__PURE__ */ new Date()).toISOString(), row.id).run();
      stats.succeeded += 1;
    } else {
      await markFailed(env, row.id, row.target, result.error ?? "unknown", row.attempts);
      stats.failed += 1;
    }
  }
  return stats;
}
__name(runMarketSync, "runMarketSync");
async function loadPackageForSync(env, packageId) {
  const row = await env.DB.prepare(
    `SELECT package_id, title, q, evidence_count, verified_at, expires_at, tier
     FROM packages WHERE package_id=? AND status IN ('fresh','stale')`
  ).bind(packageId).first();
  if (!row)
    return null;
  const priceUsdc = row.tier === "featured" ? "1000000" : "500000";
  return {
    package_id: row.package_id,
    title: row.title,
    q: row.q,
    evidence_count: row.evidence_count,
    verified_at: row.verified_at,
    expires_at: row.expires_at,
    tier: row.tier,
    price_usdc: priceUsdc,
    paid_url: `${env.OWNSITE_BASE}/buy/${row.package_id}`,
    verify_url: `${env.OWNSITE_BASE}/verify/${row.package_id}`,
    preview_url: `${env.OWNSITE_BASE}/preview/${row.package_id}`
  };
}
__name(loadPackageForSync, "loadPackageForSync");
function extractMarketEnv(env) {
  return {
    FACILITATOR_URL: env.FACILITATOR_URL,
    MARKET_BAZAAR_API_KEY: env.MARKET_BAZAAR_API_KEY,
    MARKET_AGENT402_API_KEY: env.MARKET_AGENT402_API_KEY,
    MARKET_MCP_SO_API_KEY: env.MARKET_MCP_SO_API_KEY,
    MARKET_DATAPPOINT_API_KEY: env.MARKET_DATAPPOINT_API_KEY,
    OWNSITE_BASE: env.OWNSITE_BASE,
    NETWORK: env.NETWORK,
    ASSET_USDC: env.ASSET_USDC
  };
}
__name(extractMarketEnv, "extractMarketEnv");
async function markFailed(env, id, _target, error, attempts) {
  await env.DB.prepare(
    "UPDATE sync_queue SET attempts=?, last_error=?, last_attempt_at=?, status=? WHERE id=?"
  ).bind(
    attempts + 1,
    error,
    (/* @__PURE__ */ new Date()).toISOString(),
    attempts + 1 >= 3 ? "failed" : "pending",
    id
  ).run();
}
__name(markFailed, "markFailed");
async function markSkipped(env, id, attempts) {
  await env.DB.prepare(
    "UPDATE sync_queue SET status='skipped', attempts=?, last_attempt_at=? WHERE id=?"
  ).bind(attempts, (/* @__PURE__ */ new Date()).toISOString(), id).run();
}
__name(markSkipped, "markSkipped");

// src/worker/demand-report.ts
var REPORT_TIER_LISTED = "listed";
var REPORT_TIER_BLOCKED = "blocked";
async function handlePostDemandRequest(req, env) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.topic !== "string" || body.topic.trim().length < 1) {
    return json({ error: "topic is required (min 1 char)" }, 400);
  }
  const pseudonym = typeof body.pseudonym === "string" && body.pseudonym.trim() ? body.pseudonym.trim().slice(0, 64) : crypto.randomUUID().slice(0, 8);
  const topic = body.topic.trim().toLowerCase();
  const id = `dr-${crypto.randomUUID()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `INSERT INTO demand_requests (id, topic, pseudonym, status, created_at)
     VALUES (?, ?, ?, 'pending', ?)`
  ).bind(id, topic, pseudonym, now).run();
  await scheduleDemandSync(env, id);
  return json({
    request_id: id,
    topic,
    pseudonym,
    status: "pending",
    created_at: now,
    message: "Request queued. Check status via GET /api/demand/request/:id"
  }, 201);
}
__name(handlePostDemandRequest, "handlePostDemandRequest");
async function handleGetDemandRequest(req, env) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").filter(Boolean).pop();
  if (!id)
    return json({ error: "request_id required" }, 400);
  const row = await env.DB.prepare(
    `SELECT id, topic, pseudonym, status, package_id, created_at, completed_at, error
     FROM demand_requests WHERE id=?`
  ).bind(id).first();
  if (!row)
    return json({ error: "not found" }, 404);
  if (row.status === "completed" && row.package_id) {
    const pkg = await env.DB.prepare(
      `SELECT package_id, title, tier, q, evidence_count, verified_at, expires_at, status
       FROM packages WHERE package_id=?`
    ).bind(row.package_id).first();
    return json({
      request_id: row.id,
      topic: row.topic,
      pseudonym: row.pseudonym,
      status: row.status,
      package_id: row.package_id,
      created_at: row.created_at,
      completed_at: row.completed_at,
      package: pkg ?? null
    });
  }
  return json({
    request_id: row.id,
    topic: row.topic,
    pseudonym: row.pseudonym,
    status: row.status,
    created_at: row.created_at,
    completed_at: row.completed_at,
    error: row.error ?? null
  });
}
__name(handleGetDemandRequest, "handleGetDemandRequest");
async function handleListDemandReports(_req, env) {
  const rows = await env.DB.prepare(
    `SELECT dr.id as request_id, dr.topic, dr.pseudonym, dr.status,
            dr.package_id, dr.created_at, dr.completed_at,
            p.title, p.q, p.evidence_count, p.tier, p.status as pkg_status,
            p.verified_at, p.expires_at
     FROM demand_requests dr
     LEFT JOIN packages p ON dr.package_id = p.package_id
     WHERE dr.status='completed' AND dr.package_id IS NOT NULL
     ORDER BY dr.completed_at DESC
     LIMIT 50`
  ).all();
  return json({ total: rows.results.length, reports: rows.results });
}
__name(handleListDemandReports, "handleListDemandReports");
async function runDemandCron(env) {
  const stats = { processed: 0, created: 0, errors: [] };
  const pending = await env.DB.prepare(
    `SELECT id, topic FROM demand_requests WHERE status='pending' ORDER BY created_at ASC LIMIT 50`
  ).all();
  if (!pending.results || pending.results.length === 0)
    return stats;
  const cached = await env.DB.prepare(
    `SELECT json FROM demand_candidates_cache ORDER BY loaded_at DESC LIMIT 1`
  ).first();
  if (!cached) {
    stats.errors.push("no demand_candidates_cache \u2014 upload via POST /api/admin/demand-candidates first");
    return stats;
  }
  let candidates;
  try {
    candidates = JSON.parse(cached.json);
  } catch {
    stats.errors.push("demand_candidates_cache JSON parse error");
    return stats;
  }
  for (const req of pending.results) {
    stats.processed += 1;
    try {
      const matches = filterByTopic(candidates, req.topic);
      if (matches.length === 0) {
        await updateRequestStatus(env, req.id, "expired", "no_matching_demands");
        continue;
      }
      const packageId = await createDemandPackage(env, req, matches);
      if (!packageId) {
        await updateRequestStatus(env, req.id, "expired", "package_creation_failed");
        continue;
      }
      await scheduleDemandSync(env, req.id);
      stats.created += 1;
    } catch (e) {
      const msg = e.message;
      stats.errors.push(`${req.id}: ${msg}`);
      await updateRequestStatus(env, req.id, "expired", msg);
    }
  }
  return stats;
}
__name(runDemandCron, "runDemandCron");
function filterByTopic(candidates, topic) {
  return candidates.filter((c) => {
    if (!c || typeof c !== "object")
      return false;
    const obj = c;
    const combined = [
      obj.theme,
      obj.representative_quote,
      obj.root_cause_inference,
      obj.route_hint
    ].filter(Boolean).map(String).join(" ").toLowerCase();
    return combined.includes(topic);
  });
}
__name(filterByTopic, "filterByTopic");
async function createDemandPackage(env, request, matches) {
  const safeMatches = matches ?? [];
  const packageId = `demand-${request.id.slice("dr-".length)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const expiresAt = new Date(Date.now() + 30 * 864e5).toISOString();
  const q = Math.min(1, Math.max(0.1, safeMatches.length * 0.1));
  const evidenceCount = safeMatches.length;
  const title = `Agent Forum Demand Report: ${request.topic}`;
  const meetsGate = q >= LISTED_MIN_Q && evidenceCount >= LISTED_MIN_EVIDENCE;
  const tier = meetsGate ? REPORT_TIER_LISTED : REPORT_TIER_BLOCKED;
  const status = meetsGate ? "fresh" : "blocked";
  const blockedReason = !meetsGate ? `q=${q.toFixed(2)}<${LISTED_MIN_Q} or evidence=${evidenceCount}<${LISTED_MIN_EVIDENCE}` : null;
  const reportData = buildReportData(request.topic, safeMatches);
  const dataHash = simpleHash(JSON.stringify(reportData));
  try {
    await env.DB.prepare(
      `INSERT INTO _debug_trace (ts, msg) VALUES (?, ?)`
    ).bind((/* @__PURE__ */ new Date()).toISOString(), JSON.stringify({
      pid: packageId,
      title,
      q,
      ec: evidenceCount,
      now,
      expiresAt,
      tier,
      status,
      br: blockedReason,
      dh: dataHash
    })).run();
  } catch (e) {
  }
  const existing = await env.DB.prepare(
    `SELECT package_id FROM packages WHERE package_id=?`
  ).bind(packageId).first();
  if (existing) {
    await env.DB.prepare(
      `UPDATE packages SET title=?, q=?, evidence_count=?,
        verified_at=?, expires_at=?, tier=?, status=?, blocked_reason=?, data_hash=?, updated_at=datetime('now'),
        origin='demand'
       WHERE package_id=?`
    ).bind(title, q, evidenceCount, now, expiresAt, tier, status, blockedReason ?? null, dataHash, packageId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO packages
       (package_id, title, q, evidence_count, verified_at, expires_at, tier, status, blocked_reason, data_hash, created_at, origin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demand')`
    ).bind(packageId, title, q, evidenceCount, now, expiresAt, tier, status, blockedReason, dataHash, now).run();
  }
  await env.DB.prepare(
    `INSERT INTO demand_reports (package_id, report_data)
     VALUES (?, ?)
     ON CONFLICT(package_id) DO UPDATE SET report_data=excluded.report_data`
  ).bind(packageId, JSON.stringify(reportData)).run();
  try {
    const srcCount = {};
    let maxDepth = 0;
    for (const m of safeMatches) {
      const obj = m;
      const prov = obj.provenance ?? {};
      const srcUrl = prov.source_canonical_url ?? "";
      const typed = srcUrl.includes("github") ? "github" : srcUrl.includes("ycombinator") || srcUrl.includes("news.ycombinator") ? "hn" : srcUrl.includes("moltbook") ? "moltbook" : srcUrl.includes("thecolony") ? "thecolony" : "moltchurch";
      srcCount[typed] = (srcCount[typed] ?? 0) + 1;
      if (obj.theme)
        maxDepth = Math.max(maxDepth, 4);
      else if (obj.representative_quote)
        maxDepth = Math.max(maxDepth, 3);
      else if (obj.root_cause_inference)
        maxDepth = Math.max(maxDepth, 2);
      else if (obj.route_hint)
        maxDepth = Math.max(maxDepth, 1);
    }
    await env.DB.prepare(
      `INSERT INTO match_distribution_log (package_id, topic, matches_total, max_match_depth, source_breakdown, logged_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(packageId, request.topic, safeMatches.length, maxDepth, JSON.stringify(srcCount)).run();
  } catch (_e) {
  }
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    `UPDATE demand_requests SET status='completed', package_id=?, completed_at=? WHERE id=?`
  ).bind(packageId, completedAt, request.id).run();
  return packageId;
}
__name(createDemandPackage, "createDemandPackage");
function buildReportData(topic, matches) {
  const safeMatches = Array.isArray(matches) ? matches.map((m) => m) : [];
  const items = safeMatches.map((m) => {
    const obj = m;
    return {
      demand_id: obj.demand_id ?? "",
      theme: obj.theme ?? topic,
      distinct_author_count: obj.distinct_author_count ?? 0,
      evidence_count: Array.isArray(obj.evidence_snippet_indexes) ? obj.evidence_snippet_indexes.length : 0,
      representative_quote: obj.representative_quote?.slice(0, 300) ?? "",
      root_cause_inference: obj.root_cause_inference ?? "",
      confidence: obj.confidence ?? "low",
      route_hint: obj.route_hint ?? null,
      provenance: obj.provenance ?? {},
      source_url: obj.provenance?.source_canonical_url ?? ""
    };
  });
  return {
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    topic,
    total_demands: items.length,
    total_authors: items.reduce((s, i) => s + i.distinct_author_count, 0),
    items
  };
}
__name(buildReportData, "buildReportData");
async function scheduleDemandSync(env, requestId) {
  const pkgId = `demand-${requestId.slice("dr-".length)}`;
  await env.DB.prepare(
    `INSERT INTO sync_queue (package_id, target, action, status, created_at, attempts)
     VALUES (?, 'agent402', 'publish', 'pending', ?, 0)
     ON CONFLICT DO NOTHING`
  ).bind(pkgId, (/* @__PURE__ */ new Date()).toISOString()).run();
}
__name(scheduleDemandSync, "scheduleDemandSync");
async function updateRequestStatus(env, id, status, errorMsg) {
  await env.DB.prepare(
    `UPDATE demand_requests SET status=?, error=?, completed_at=? WHERE id=?`
  ).bind(status, errorMsg, (/* @__PURE__ */ new Date()).toISOString(), id).run();
}
__name(updateRequestStatus, "updateRequestStatus");
function simpleHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "0x" + (h >>> 0).toString(16).padStart(8, "0");
}
__name(simpleHash, "simpleHash");
async function handleGetDemandReport(req, env) {
  const url = new URL(req.url);
  const pid = url.pathname.split("/").filter(Boolean).pop();
  if (!pid)
    return json({ error: "package_id required" }, 400);
  const pkg = await env.DB.prepare(
    `SELECT package_id, title, q, evidence_count, tier, status,
            verified_at, expires_at, created_at
     FROM packages WHERE package_id=? AND package_id LIKE 'demand-%'`
  ).bind(pid).first();
  if (!pkg)
    return json({ error: "report not found" }, 404);
  const meta = await env.DB.prepare(
    `SELECT report_data FROM demand_reports WHERE package_id=?`
  ).bind(pid).first();
  if (!meta)
    return json({ error: "report data not available" }, 404);
  return json({
    package_id: pkg.package_id,
    title: pkg.title,
    q: pkg.q,
    evidence_count: pkg.evidence_count,
    tier: pkg.tier,
    status: pkg.status,
    verified_at: pkg.verified_at,
    expires_at: pkg.expires_at,
    report: JSON.parse(meta.report_data)
  });
}
__name(handleGetDemandReport, "handleGetDemandReport");
async function handlePostDemandCandidates(req, env) {
  const auth = req.headers.get("x-admin-secret");
  if (!auth || auth !== (env.DEMAND_ADMIN_SECRET ?? "")) {
    return json({ error: "unauthorized" }, 401);
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.candidates)) {
    return json({ error: "expected { candidates: [...] }" }, 400);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const jsonStr = JSON.stringify(body.candidates);
  const hash3 = simpleHash(jsonStr);
  let validCount = 0;
  for (const item of body.candidates) {
    if (item && typeof item === "object" && item.theme) {
      validCount += 1;
    }
  }
  await env.DB.prepare(
    `INSERT INTO demand_candidates_cache (loaded_at, json, hash)
     VALUES (?, ?, ?)
     ON CONFLICT DO UPDATE SET json=excluded.json, loaded_at=excluded.loaded_at, hash=excluded.hash`
  ).bind(now, jsonStr, hash3).run();
  return json({
    status: "ok",
    loaded_at: now,
    hash: hash3,
    total_candidates: body.candidates.length,
    valid_candidates: validCount
  });
}
__name(handlePostDemandCandidates, "handlePostDemandCandidates");

// src/worker/cron-dispatcher.ts
async function runCron(env, scheduledAt) {
  const start = Date.now();
  const parsed = scheduledAt && /^\d{4}-\d{2}-\d{2}T/.test(scheduledAt) ? new Date(scheduledAt) : /* @__PURE__ */ new Date();
  const now = Number.isNaN(parsed.getTime()) ? /* @__PURE__ */ new Date() : parsed;
  const report = {
    ok: true,
    scheduled_at: now.toISOString(),
    stats: {},
    duration_ms: 0
  };
  const minute = now.getUTCMinutes();
  const hour = now.getUTCHours();
  const day = now.getUTCDate();
  const immediate = scheduledAt === "true";
  try {
    if (immediate || minute % 15 === 0) {
      report.stats.sync = await runSyncQueue(env);
      report.stats.market = await runMarketSync(env);
      report.stats.demand = await runDemandCron(env);
    }
    if (immediate || minute === 0) {
      report.stats.ttl = await runTtlCron(env);
    }
    if (immediate || minute === 30 && hour === 0) {
      report.stats.dashboard = await runDashboardCron(env);
    }
    if (minute === 15) {
      report.stats.reverify = await runReverifyCron(env);
    }
    if (minute === 45) {
      report.stats.settle = await runSettleCron(env);
    }
    if (minute === 0 && hour === 6) {
      report.stats.refetch = await runRefetchScan(env);
    }
    if (minute === 30 && hour === 6) {
      report.stats.agent_index = await runAgentIndexCron(env);
    }
    if (minute === 0 && hour === 7) {
      report.stats.cursor_audit = await runCursorAuditCron(env);
    }
    if (minute === 50 && hour === 8) {
      report.stats.held_timeout = await runHeldTimeoutCron(env);
    }
    if (minute === 0 && hour === 9) {
      report.stats.facilitator_health = await runFacilitatorHealthCron(env);
    }
  } catch (e) {
    report.ok = false;
    report.stats.error = e instanceof Error ? e.message : String(e);
  }
  report.duration_ms = Date.now() - start;
  return new Response(
    JSON.stringify(report),
    { headers: { "content-type": "application/json" } }
  );
}
__name(runCron, "runCron");
async function runSyncQueue(env) {
  const stats = {
    sync_publish: 0,
    sync_fail: 0,
    sync_skip: 0,
    stale_marked: 0,
    recall_marked: 0
  };
  const { results: queue } = await env.DB.prepare(
    `SELECT * FROM sync_queue WHERE status='pending'
     AND target NOT IN ('bazaar','agent402','mcp_so','datapoint')
     ORDER BY created_at ASC LIMIT 20`
  ).all();
  for (const row of queue) {
    if (row.attempts >= 3) {
      await env.DB.prepare(
        "UPDATE sync_queue SET status='failed', last_attempt_at=? WHERE id=?"
      ).bind((/* @__PURE__ */ new Date()).toISOString(), row.id).run();
      stats.sync_fail += 1;
      continue;
    }
    try {
      await pushToTarget(env, row);
      await env.DB.prepare(
        "UPDATE sync_queue SET status='done', attempts=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, (/* @__PURE__ */ new Date()).toISOString(), row.id).run();
      stats.sync_publish += 1;
    } catch (e) {
      await env.DB.prepare(
        "UPDATE sync_queue SET attempts=?, last_error=?, last_attempt_at=? WHERE id=?"
      ).bind(row.attempts + 1, String(e), (/* @__PURE__ */ new Date()).toISOString(), row.id).run();
      stats.sync_fail += 1;
    }
  }
  return stats;
}
__name(runSyncQueue, "runSyncQueue");

// src/do/nonce-lock.ts
import { DurableObject } from "cloudflare:workers";
var NonceLockDO = class extends DurableObject {
  locks = /* @__PURE__ */ new Map();
  async fetch(request) {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const action = url.searchParams.get("action") ?? "acquire";
    switch (action) {
      case "acquire":
        return this.handleAcquire(body.txHash ?? "", body.ttlSeconds ?? 60);
      case "release":
        return this.handleRelease(body.txHash ?? "");
      case "peek":
        return this.handlePeek(body.txHash ?? "");
      default:
        return json2({ error: "unknown_action" }, 400);
    }
  }
  handleAcquire(txHash, ttlSeconds) {
    const now = Date.now();
    const cur = this.locks.get(txHash);
    if (cur && cur.expiresAt > now) {
      return json2({ ok: false, holder: cur.holder });
    }
    this.locks.set(txHash, { holder: `req-${now}-${Math.random().toString(36).slice(2)}`, expiresAt: now + ttlSeconds * 1e3 });
    return json2({ ok: true, txHash });
  }
  handleRelease(txHash) {
    this.locks.delete(txHash);
    return json2({ ok: true });
  }
  handlePeek(txHash) {
    return json2({ holder: this.locks.get(txHash) ?? null });
  }
};
__name(NonceLockDO, "NonceLockDO");
function json2(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}
__name(json2, "json");

// src/do/quota.ts
import { DurableObject as DurableObject2 } from "cloudflare:workers";
var QuotaDO = class extends DurableObject2 {
  quotas = /* @__PURE__ */ new Map();
  async fetch(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "check";
    const body = await request.json().catch(() => ({}));
    switch (action) {
      case "check":
        return this.handleCheck(body.key ?? "", body.limit ?? 1, body.windowSeconds ?? 60);
      case "reset":
        this.quotas.delete(body.key ?? "");
        return json3({ ok: true });
      default:
        return json3({ error: "unknown_action" }, 400);
    }
  }
  handleCheck(key, limit, windowSeconds) {
    const now = Date.now();
    const bucketStart = Math.floor(now / (windowSeconds * 1e3));
    const cur = this.quotas.get(key);
    const isNewBucket = !cur || cur.bucketStart !== bucketStart;
    const count = isNewBucket ? 0 : cur.count;
    if (count >= limit) {
      return json3({ ok: false, remaining: 0, resetAt: (bucketStart + 1) * windowSeconds * 1e3 });
    }
    this.quotas.set(key, { count: count + 1, bucketStart, windowSeconds });
    const resetAt = (bucketStart + 1) * windowSeconds * 1e3;
    return json3({ ok: true, remaining: limit - count - 1, resetAt });
  }
};
__name(QuotaDO, "QuotaDO");
function json3(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}
__name(json3, "json");

// src/do/circuit.ts
import { DurableObject as DurableObject3 } from "cloudflare:workers";
var CircuitBreakerDO = class extends DurableObject3 {
  cbState = { state: "closed", failures: 0, openedAt: 0 };
  async fetch(request) {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    if (action === "state")
      return json4({ ...this.getFresh() });
    if (action === "can-proceed") {
      const s = this.getFresh();
      return json4({ ok: s.state === "closed" || s.state === "half-open", state: s.state });
    }
    if (action === "success") {
      this.recordSuccess();
      return json4({ ok: true });
    }
    if (action === "failure") {
      this.recordFailure();
      return json4({ ok: true, state: this.cbState.state });
    }
    return json4({ error: "unknown_action" }, 400);
  }
  getFresh() {
    if (this.cbState.state === "open" && Date.now() - this.cbState.openedAt > 6e4) {
      this.cbState.state = "half-open";
    }
    return this.cbState;
  }
  recordSuccess() {
    this.cbState.failures = 0;
    this.cbState.state = "closed";
  }
  recordFailure() {
    this.cbState.failures += 1;
    if (this.cbState.failures >= 5) {
      this.cbState.state = "open";
      this.cbState.openedAt = Date.now();
    }
  }
};
__name(CircuitBreakerDO, "CircuitBreakerDO");
function json4(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}
__name(json4, "json");

// src/worker/index.ts
var worker_default = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (req.headers.get("cf-scheduled")) {
      try {
        return await runCron(env, req.headers.get("cf-scheduled") ?? void 0);
      } catch (e) {
        const err = e;
        console.error("[cron] unhandled error:", err?.message ?? String(e));
        return json({ error: err?.message ?? "internal_cron_error", code: 1101 }, 500);
      }
    }
    if (req.method === "OPTIONS")
      return corsOptionsResponse();
    if (p === "/.well-known/agent-index.json") {
      return withCors(await handleAgentIndexQuery(req, env));
    }
    if (p.startsWith("/.well-known/"))
      return serveWellKnown(p, env);
    if (p === "/" || p === "") {
      const rootPayload = JSON.stringify({
        x402Version: 2,
        error: "Payment Required",
        resource: {
          url: "https://ownsite-aeo.jerry-aeo.workers.dev/",
          description: "AEO-OS Verified Content Marketplace - 4 packages available at /buy/{id}"
        },
        accepts: [{
          scheme: "exact",
          network: env.NETWORK || "eip155:84532",
          amount: "500000",
          asset: env.ASSET_USDC,
          payTo: env.PAY_TO,
          maxTimeoutSeconds: 300,
          mimeType: "application/json",
          extra: { name: "USDC", version: "2" }
        }],
        extensions: {
          bazaar: {
            info: {
              input: { type: "http", method: "GET" },
              output: { example: "application/json" }
            },
            name: "AEO-OS Verified Content Marketplace",
            description: "Agent2Agent capability marketplace with x402 verified packages",
            tags: ["agent", "x402", "a2a", "marketplace"],
            schema: { type: "object", url: `${env.OWNSITE_BASE}/.well-known/agent-index.json` }
          }
        }
      });
      return new Response(rootPayload, {
        status: 402,
        headers: {
          "content-type": "application/json",
          "PAYMENT-REQUIRED": Buffer.from(rootPayload).toString("base64"),
          "x-payment-accepts": "application/json",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "content-type, x-payment, PAYMENT-SIGNATURE"
        }
      });
    }
    if (p === "/internal/sync")
      return handleInternalSync(req, env);
    if (p.startsWith("/internal/unrecall/"))
      return handleUnrecall(req, env);
    if (p.startsWith("/verify/"))
      return withCors(await handleVerify(req, env));
    if (p.startsWith("/preview/"))
      return withCors(await handlePreview(req, env));
    if (p.startsWith("/status/"))
      return withCors(await handleStatus(req, env));
    if (p.startsWith("/recover/"))
      return withCors(await handleRecover(req, env));
    if (p.startsWith("/buy/")) {
      return withCors(await handleBuy(req, env, {
        getPackageStatus: async (id) => await env.KV.get(`status:${id}`),
        getReplacement: async (id) => await env.KV.get(`replacement:${id}`),
        getPackageMeta: async (id) => {
          const d1Meta = await env.DB.prepare("SELECT package_id, tier, title, q, evidence_count, expires_at FROM packages WHERE package_id = ?").bind(id).first();
          if (!d1Meta)
            return null;
          const kvMeta = await env.KV.get(`meta:${id}`, "json");
          return kvMeta ?? d1Meta;
        },
        getData: async (id) => {
          const pkg = await env.KV.get(`pkg:${id}`, "json");
          return pkg?.data ?? pkg;
        },
        getVerification: async (id) => {
          return await env.KV.get(`verify:${id}`, "json");
        }
      }));
    }
    if (p.startsWith("/reverify/"))
      return handleReverifyPush(req, env);
    if (p === "/mcp")
      return withCors(await handleMcp(req, env));
    if (p === "/dashboard.json")
      return withCors(await handleDashboard(env));
    if (p.startsWith("/dashboard/sales")) {
      try {
        const days = Math.min(90, Math.max(1, parseInt(new URL(req.url).searchParams.get("days") ?? "30", 10)));
        return withCors(await handleDashboardSales(env, days));
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (p === "/api/a2a/metrics") {
      try {
        return withCors(await handleA2AMetrics(req, env));
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }
    if (p === "/api/demand/request") {
      if (req.method === "POST")
        return withCors(await handlePostDemandRequest(req, env));
    }
    if (p.startsWith("/api/demand/request/"))
      return withCors(await handleGetDemandRequest(req, env));
    if (p === "/api/demand/reports")
      return withCors(await handleListDemandReports(req, env));
    if (p.startsWith("/api/demand/reports/"))
      return withCors(await handleGetDemandReport(req, env));
    if (p === "/api/admin/demand-candidates") {
      if (req.method === "POST")
        return withCors(await handlePostDemandCandidates(req, env));
    }
    if (p === "/healthz") {
      return json({
        ok: true,
        service: "ownsite-aeo",
        version: "1.18",
        base: env.OWNSITE_BASE,
        network: env.NETWORK,
        mock_facilitator: env.MOCK_FACILITATOR === "1",
        do_available: {
          nonce_lock: !!env.NONCE_LOCK,
          quota: !!env.QUOTA,
          circuit: !!env.CIRCUIT
        },
        time: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (env.ASSETS) {
      try {
        return await env.ASSETS.fetch(req);
      } catch {
      }
    }
    return json({ error: "not_found" }, 404);
  }
};
async function serveWellKnown(p, env) {
  const key = "wellknown:" + p;
  const cached = await env.KV.get(key, "text");
  if (cached) {
    return new Response(cached, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60",
        "x-source": "worker-kv"
      }
    });
  }
  if (env.ASSETS) {
    try {
      const r = await env.ASSETS.fetch(new Request(`${env.OWNSITE_BASE}${p}`));
      return new Response(r.body, {
        status: r.status,
        headers: {
          ...Object.fromEntries(r.headers.entries()),
          "cache-control": "public, max-age=60",
          "x-source": "github-pages"
        }
      });
    } catch {
    }
  }
  return json({ error: "not_found" }, 404);
}
__name(serveWellKnown, "serveWellKnown");
export {
  CircuitBreakerDO,
  NonceLockDO,
  QuotaDO,
  worker_default as default
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/_shortw_utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=index.js.map
