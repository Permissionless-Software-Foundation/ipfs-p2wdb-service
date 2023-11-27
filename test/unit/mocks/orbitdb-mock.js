/*
  A mocked version of the OrbitDB library.
*/
class OrbitDBMock {
    constructor() {
        this.all = {};
        this.id = 'id';
        this.options = {
            accessController: {
                bchjs: {}
            }
        };
        this.access = {
            bchjs: {}
        };
    }
    async put() {
        return 'hash';
    }
    async load() {
        return 'load';
    }
}

class OrbitDBAdapterMock {
    constructor() {
        this.db = {
            put: () => {
                return 'hash';
            }
        };
    }
    async start() {
        return {};
    }
    async insert() {
        return {};
    }
    async readAll() {
        return { key: 'value' };
    }
}

export { OrbitDBMock };

export { OrbitDBAdapterMock };

export default {
    OrbitDBMock,
    OrbitDBAdapterMock
};
