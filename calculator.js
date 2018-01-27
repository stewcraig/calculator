
$(document).ready(function(){

  //Sets maximum screen size
  var maxDigits = 10;

  //Uses BigNumber library to avoid floating point calculation errors
  BigNumber.config({
  DECIMAL_PLACES: maxDigits-1,
  ROUNDING_MODE: 4 })

  // Create calcutor object
  // Calculator object stores:
  // - total value (i.e. sum of calculations so far)
  // - current value (i.e. when keys pressed)
  // - Functions to undertake operations for when buttons are pressed
  var calculator = {
    total: new BigNumber(0),
    currentVal: new BigNumber(0),
    decDigits: 0,
    operation: undefined,
    lastOp: undefined,

    numberPressed: function(num){
      var num = new BigNumber(parseInt(num));
      var ten = new BigNumber(10);
      //Check if last operation pressed was equals or if last result was undefined - if followed by a number button being pressed then clear the total value
      if (this.lastOp === "equals" || this.total==="Undefined"){
        this.clearValues("AC");
      }

      //If current value does not already exist then create new value. Current value is cleared after operation or clear buttons are pressed
      !this.currentVal ? this.currentVal = new BigNumber(0) : null;

      //Checks that length of currentVal still fits in display. Only adds on additional number if there is still room to display
      if (this.currentVal.toString().length < maxDigits){
        //If decimal place button has been pressed add numbers after decimal point
        if (this.decDigits > 0){
          this.currentVal = this.currentVal.plus(num.dividedBy(ten.toPower(this.decDigits)))
          this.decDigits+=1;
        }
        //If decimal button hasn't been pressed then add number to end of current number
        else{
          this.currentVal=this.currentVal.times(10).plus(parseInt(num));
        }
      }
    },

    clearValues: function(type){
      //Function will always do a standard clear
      this.currentVal = undefined; //Set to undefined - ensures claculator does not try to evaluate result if there is not current value
      this.decDigits=0;

      //If full clear is required - resets total value and returns operation to addition
      if(type=== "AC"){
        this.total = new BigNumber(0);
        this.operation = this.addition;
        this.lastOp = undefined;
      }
    },

    evaluate: function(){
      //Only evaluates result if a number has been entered
      if (this.currentVal){
        calculator.operation()
      }
    },

    operationPressed: function(op){
      //If operation is pressed then sets operation variable to function that calculates the operation
      //This allows for operation to be calculated after second value in calculation has been entered
      switch (op){
        case "add":
          this.operation = this.addition;
          break;
        case "subtract":
          this.operation = this.subtraction;
          break;
      case "multiply":
          this.operation = this.multiplication;
          break;
        case "divide":
          this.operation = this.division;
          break;
        case "equals":
          this.operation = undefined;
          this.equalsLast = true;
          break;
      }
      this.lastOp = op;
    },

    //Check if decimal button has been pressed - if so sets number of decimal place values to 1
    decPressed: function(){
      if(this.decDigits===0){this.decDigits=1;}
    },

    //Functions to run operationPressed
    addition: function(){
      this.total=this.total.plus(this.currentVal);
      this.clearValues();
    },
    subtraction: function(){
      this.total=this.total.minus(this.currentVal);
      this.clearValues();
    },
    multiplication: function(){
      this.total=this.total.times(this.currentVal);
      this.clearValues();
    },
    division: function(){
      //Check to see if attempting to divide by 0, return 'undefined if so'
      if (this.currentVal.toString()==="0"){
        this.total = "Undefined";
      }
      else{
        this.total=this.total.dividedBy(this.currentVal);
      }
      this.clearValues();
    },

    // Functions to run squareroot and plus/minus button operations.
    // These operations are evaluated immediately
    sqareRt: function(){
      //If pressed while there is a 'currentval' then convert 'currentval' into decimal
      //If pressed while total value only, set total value to negative
      if (this.currentVal){
        this.currentVal = this.currentVal.sqrt();
        return this.currentVal;
      }
      else{
        this.total = this.total.sqrt();
        return this.total;
      }
    },

    plusMinus: function(){
      //If pressed while there is a 'currentval' then convert 'currentval' into decimal
      //If pressed while total value only, set total value to negative
      if (this.currentVal){
        this.currentVal = this.currentVal.times(-1);
        return this.currentVal;
      }
      else{
        this.total = this.total.times(-1);
        return this.total;
      }
    }
  }

  //Display text on calculator screen
  function displayVal(val){
    //Before displaying total, check to see if result is too long to display on screen (if so display in expential format)
    if (val.toString().length > maxDigits){
      val = val.toExponential(maxDigits-6);
    }
    $("#display-text").empty();
    $("#display-text").text(val);
  }

  //Run reset on calcualtor start - clears all stored values
  calculator.clearValues("AC");
  //Display default values
  displayVal(calculator.total);

  //Check if number button is pressed
  $(".num-button").on("click tap", function(){
    calculator.numberPressed($(this).text());
    //Convert to string with toFixed to display trailing zeros
    displayVal(calculator.currentVal.toFixed(Math.max(calculator.decDigits-1,0)));
  });

  //When decimal button pressed
  $(".dec-button").on("click tap", calculator.decPressed.bind(calculator));

  //When operator button  press (+,-,x,/,=)
  $(".operation-button").on("click tap", function(){
    //Evaluate the current result and display
    calculator.evaluate();
    displayVal(calculator.total);
    calculator.operationPressed($(this).attr("id"));
  });

  //When plus minus button pressed
  $('#plusMinus').on("click tap", function(){
    displayVal(calculator.plusMinus());
  });

  //When sqrt  button is pressed
  $('#squareRt').on("click tap", function(){
    displayVal(calculator.sqareRt());
  });

  //When clear button pressed
  $(".clear-button").on("click tap", function(){
    switch ($(this).text().trim()){
      case "C":
          calculator.clearValues();
          break;
      case "AC":
          calculator.clearValues("AC");
          break;
    }
    //Display total stored in calculator

    displayVal(calculator.total);
  });
});