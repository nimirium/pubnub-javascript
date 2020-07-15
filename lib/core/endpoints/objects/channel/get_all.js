"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../../constants/operations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetAllChannelMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include, _params$include2, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
      queryParams.include = ['custom'];
    }

    if (params === null || params === void 0 ? void 0 : (_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.totalCount) {
      var _params$include3;

      queryParams.count = (_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.totalCount;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    if (params === null || params === void 0 ? void 0 : params.limit) {
      queryParams.limit = params.limit;
    }

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=get_all.js.map