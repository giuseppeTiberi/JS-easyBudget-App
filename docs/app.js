// easyBudget Application

// BUDGET CONTROLLER (Data controller)
var budgetController = (function() {
// When the JavaScript runtime hits this line here, the IIFE gets executed
// and this anonymous function is declared and immediately invoked
    
    // an IIFE allows us to have data privacy because it creates a new scope
    // that is not visible from the outside scope.

    // Expense Constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // Income Constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Updating the budget
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum = sum + current.value;
        });
        /* [300, 100, 500]
           sum = 0 + 300
            sum = 300 + 100
             sum = 400 + 500 */
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        // if there are no budget values and no total expenses the percentage values is -1, so it does not exist
        percentage: -1
    };

    return {
        // Adding a new item to the Budget Controller to store information in the data object
        addItem: function(type, des, val) {
            var newItem, ID;

            // [1 2 3 5 8], next ID = 9
            // ID = last ID + 1

            // Create new item ID
            if (data.allItems[type].length > 0) {
                // set last added item ID, [... - 1 ] because arrays index started to 0   
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                // set first added item ID 
                ID = 0;
            }
         
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp' ) {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element 
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // Eg: remove id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8] ---> maps returns the update type (inc or exp) array
            // index = 3

            // map() returns a brand new array of elements
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            // The indexOf() method returns the first index at which a given element can be found in the array, or -1 if it is not present.
            index = ids.indexOf(id);

            if (index !== -1) {
                // .splice(element, quantity) removes or adds element from array
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                // EX: Inc: 300; Exp: 100; -> 100/300 = 0.3333 * 100 = 33% 
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(current) {
                // update Expense.percentage passing totalIncome as parameter
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            }); 
            // returns allPercentages updated
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
    };


})();

// UI CONTROLLER
var UIController = (function() {
  
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

     // We create our own ForEach method for nodeLists
     var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return { 
        getInputValue : function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListitem: function(obj, type) {
            
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            // Node.removeChild() method removes a child node from the DOM. Returns removed node.
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            // the .querySelectorAll() method returns a NodeList, representing a list of the document's elements that match the specified group of selectors.
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // transform a List in Array using the call() method, which allows for a function/method belonging to one object to be assigned and called for a different object.
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                // to clear the description and input values
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentages) {
            // the querySelectorAll() method returns a nodeList
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
        
            nodeListForEach(fields, function(current, index) {
                // if the percentage is greater than zero, show it
                if (percentages[index] > 0) {
                    // the current is expensesPercLabel, and so the '.item__percentage' DOM node
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })

        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();

            months = ['January',  'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                });
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
     
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();

        // in this case the ctrlAddItem argument is a CALLBACK, so it does not needs parenthesis
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // set up and EventListener for a keypress event (ENTER button)
        document.addEventListener('keypress', function(event) {
            // log the key button pressed
            // console.log(event); 

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

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages 
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInputValue();
        //  console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListitem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages();

        } else {
            window.alert('Please fill the "Add Description" and "Value" fields properly!');
        }
    };

    var ctrlDeleteItem = function(event) {
        // we need this event parameter because we wanna know what is the target element that bubbles up and create the Event Delegation
       var itemID, splitID, type, ID;
        
        // event.target: A reference to the object that dispatched the event --> it bubbles up from the button to the id="income-0" DOM node
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // inc-1 ---> type-ID
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure (BudgetController)
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('The easyBudget Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }    

})(budgetController, UIController);


controller.init();