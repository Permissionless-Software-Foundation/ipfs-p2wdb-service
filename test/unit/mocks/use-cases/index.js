import ReadEntryMock from "./read-entry.mock.js";
/*
  Mocks for the use cases.
*/
/* eslint-disable */
class UserUseCaseMock {
    async createUser(userObj) {
        return {};
    }
    async getAllUsers() {
        return true;
    }
    async getUser(params) {
        return true;
    }
    async updateUser(existingUser, newData) {
        return true;
    }
    async deleteUser(user) {
        return true;
    }
    async authUser(login, passwd) {
        return {
            generateToken: () => { }
        };
    }
}
class UseCasesMock {
    constuctor(localConfig = {}) {
        // this.entry = {
        //   readEntry: new ReadEntryMock(),
        //   addEntry: () => {}
        // }
        //
        // this.webhook = {
        //   addWebhook: {
        //     addNewWebhook: async () => {}
        //   },
        //   remove: async () => {}
        // }
        //
        // this.user = new UserUseCaseMock(localConfig)
    }
    user = new UserUseCaseMock();
    webhook = {
        addWebhook: {
            addNewWebhook: async () => { }
        },
        remove: async () => { }
    };
    entry = {
        readEntry: new ReadEntryMock(),
        addEntry: {
            addUserEntry: () => {
                return 'hash';
            },
            addBchEntry: async () => { }
        },
        cost: {
            getPsfCost: async () => { },
            getPsfCostTarget: async () => { },
            getBchCost: async () => { }
        }
    };
}
export default UseCasesMock;
