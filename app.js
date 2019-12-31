// Notice: for old notes from Lecture 77, please refer to old-app.js

var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage= -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    // This object will act as a data structure to store 
    // all needed information (when you can, DO THIS!)
    var data = {
        // 'allItems' is an object that has two arrays: one that contains
        // expense objects, and another that contains income objects.
       allItems: {
            exp: [],
            inc: []
       },
       // 'totals' is an object that contains a total expense property,
       // and a property that holds the total income
       totals: {
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            // How do we get the ID? We want each ID to be unique and adaptable if elements are removed and added.
            // Example:
            // [1, 2, 3, 4, 5] next ID = 6
            // [1, 2, 4, 6, 8] next ID = 9
            // ID = last ID + 1

            // Create the new ID (equivalent to below): 
            // data.allItems.inc[data.allItems.inc.length - 1].id + 1;
            if (data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }
           
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Push the new item into data structure (brackets are used to select property)
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // Returns a new array filled with the IDs of each element in the selected array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate % of income that was spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})();

var UIController = (function() {

    var DOMStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputVal : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        // + or - before number
        // exactly two decimal points (2310.4567 -> 2,310.46)
        // comma separating the thousands 

        num = Math.abs(num);
        num = num.toFixed(2);
        var numSplit = num.split('.');
        var int = numSplit[0], dec = numSplit[1], sign;
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, int.length);
        }
        /// when placed here, the ternary operation will simply return one of the two options
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // Node lists lack a for each method, so here, we created a 
    // custom one. nodeListForEach is a function that simply
    // loops over a node list and executes a callback function
    // on it. 
    var nodeListForEach = function(list, callback) {
         for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {
                // Will be either 'inc' or 'exp'
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMStrings.inputVal).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;
            // Create HTML string with placeholder text

            if (type == 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArr;
            // The querySelectorAll will return a node list of the elements with the matching selectors
            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputVal);

            // Convert fields from node list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            // Loop through the array and set each element's value to empty
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            // Places focus on description field
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            

            // Here is where we call nodeListForEach. 'fields' is the 
            // node list we pass, and the callback is the anonymous
            // function in the function parameters.
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'October', 'September', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDesc + ',' + DOMStrings.inputVal);
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };
})();

var appController = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display budget on UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller 
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI
        UIController.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

             // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the new item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIController.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function(event) {
                    // This statement returns the ID of the 'target' (i.e. the element that 
                    // was clicked)'s 4th parent. (Event > Target > Go up 4 > get it's
                    // HTML ID attribute.) This is known as 'DOM traversal.'
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        var splitID, type, ID;
        if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0]; ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc:0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);





appController.init();