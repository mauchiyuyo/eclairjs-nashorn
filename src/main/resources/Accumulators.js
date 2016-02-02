/*                                                                         
* Copyright 2015 IBM Corp.                                                 
*                                                                          
* Licensed under the Apache License, Version 2.0 (the "License");          
* you may not use this file except in compliance with the License.         
* You may obtain a copy of the License at                                  
*                                                                          
*      http://www.apache.org/licenses/LICENSE-2.0                          
*                                                                          
* Unless required by applicable law or agreed to in writing, software      
* distributed under the License is distributed on an "AS IS" BASIS,        
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
* See the License for the specific language governing permissions and      
* limitations under the License.                                           
*/ 



/**
 * A data type that can be accumulated, ie has an commutative and associative "add" operation,
 * but where the result type, `R`, may be different from the element type being added, `T`.
 *
 * You must define how to add data, and how to merge two of these together.  For some data types,
 * such as a counter, these might be the same operation. In that case, you can use the simpler
 * {@link Accumulator}. They won't always be the same, though -- e.g., imagine you are
 * accumulating a set. You will add items to the set, and you will union two sets together.
 *
 * @classdesc
 * @constructor
 * @param {object} initialValue initial value of accumulator
 * @param {AccumulableParam} param helper object defining how to add elements
 * @param {string} name human-readable name for use in Spark's web UI
 */
/*
 * NOTE for now EclairJS will only support floats and int types 
 * 
 * 
 */
var Accumulable = function() {
	this.logger = Logger.getLogger("Accumulable_js");
	this.logger.debug("constructor");
	var jvmObject;
	if (arguments.length == 1) {
		jvmObject = arguments[0]
	} else {
		var value = arguments[0];
		if (arguments[1] instanceof  FloatAccumulatorParam) {
			value = parseFloat(value);
		} else if (arguments[1] instanceof IntAccumulatorParam) {
			value = new java.lang.Integer(parseInt(value)); // we need to create a Integer or we will get a java.lang.Double 
		}
		var accumulableParam_uw = Utils.unwrapObject(arguments[1]);
		jvmObject = new org.apache.spark.Accumulable(value,accumulableParam_uw,arguments[2]);
	}
	 
	 JavaWrapper.call(this, jvmObject);

};

Accumulable.prototype = Object.create(JavaWrapper.prototype);

Accumulable.prototype.constructor = Accumulable;


/**
 * Add more data to this accumulator / accumulable
 * @param {object} term  the data to add
 */
Accumulable.prototype.add = function(term) {
	var term_uw = Utils.unwrapObject(term);
	this.getJavaObject().add(term_uw);
}


/**
 * Merge two accumulable objects together
 *
 * Normally, a user will not want to use this version, but will instead call `add`.
 * @param {object} term  the other `R` that will get merged with this
 */
Accumulable.prototype.merge = function(term) {
	var term_uw = Utils.unwrapObject(term);
    this.getJavaObject().merge(term_uw);
}


/**
 * Access the accumulator's current value; only allowed on master.
 * @returns {object} 
 */
Accumulable.prototype.value = function() {
   var javaObject =  this.getJavaObject().value();
   return Utils.javaToJs(javaObject);
}


/**
 * Get the current value of this accumulator from within a task.
 *
 * This is NOT the global value of the accumulator.  To get the global value after a
 * completed operation on the dataset, call `value`.
 *
 * The typical use of this method is to directly mutate the local value, eg., to add
 * an element to a Set.
 * @returns {object} 
 */
Accumulable.prototype.localValue = function() {
   var javaObject =  this.getJavaObject().localValue();
   return Utils.javaToJs(javaObject);
}

/**
 * Set the accumulator's value; only allowed on master
 * @param {object}
 */
Accumulable.prototype.setValue = function(newValue) {
   var newValue_uw = Utils.unwrapObject(newValue);
    this.getJavaObject().setValue(newValue_uw);
}


/**
 * @returns {string} 
 */
Accumulable.prototype.toString = function() {
   return  this.getJavaObject().toString();
}


/**
 * Helper object defining how to accumulate values of a particular type. An implicit
 * AccumulableParam needs to be available when you create {@link Accumulable}s of a specific type.
 *
 * @classdesc
 * @constructor
 */


var AccumulableParam = function(jvmObject) {
	JavaWrapper.call(this, jvmObject);
}

AccumulableParam.prototype = Object.create(JavaWrapper.prototype);

AccumulableParam.prototype.constructor = AccumulableParam;



/**
 * Add additional data to the accumulator value. Is allowed to modify and return `r`
 * for efficiency (to avoid allocating objects).
 *
 * @param {object} r  the current value of the accumulator
 * @param {object} t  the data to be added to the accumulator
 * @returns {object}  the new value of the accumulator
 */
AccumulableParam.prototype.addAccumulator = function(r,t) {
   var r_uw = Utils.unwrapObject(r);
   var t_uw = Utils.unwrapObject(t);
   var javaObject =  this.getJavaObject().addAccumulator(r_uw,t_uw);
   return Utils.javaToJs(javaObject);
}


/**
 * Merge two accumulated values together. Is allowed to modify and return the first value
 * for efficiency (to avoid allocating objects).
 *
 * @param {object} r1  one set of accumulated data
 * @param {object} r2  another set of accumulated data
 * @returns {object}  both data sets merged together
 */
AccumulableParam.prototype.addInPlace = function(r1,r2) {
   var r1_uw = Utils.unwrapObject(r1);
   var r2_uw = Utils.unwrapObject(r2);
   var javaObject =  this.getJavaObject().addInPlace(r1_uw,r2_uw);
   return Utils.javaToJs(javaObject);
}


/**
 * Return the "zero" (identity) value for an accumulator type, given its initial value. For
 * example, if R was a vector of N dimensions, this would return a vector of N zeroes.
 * @param {object}
 * @returns {object} 
 */
AccumulableParam.prototype.zero = function(initialValue) {
   var initialValue_uw = Utils.unwrapObject(initialValue);
   var javaObject =  this.getJavaObject().zero(initialValue_uw);
   return Utils.javaToJs(javaObject);
}



/**
 * A simpler value of {@link Accumulable} where the result type being accumulated is the same
 * as the types of elements being merged, i.e. variables that are only "added" to through an
 * associative operation and can therefore be efficiently supported in parallel. They can be used
 * to implement counters (as in MapReduce) or sums. EclairJS supports accumulators of numeric
 * value types.
 *
 * An accumulator is created from an initial value `v` by calling [[SparkContext#accumulator]].
 * Tasks running on the cluster can then add to it using the [[Accumulable#add]].
 * However, they cannot read its value. Only the driver program can read the accumulator's value,
 * using its value method.
 *
 * 
 * @example 
 * 	var accum = sparkContext.accumulator(0);
 *	sparkContext.parallelize([1, 2, 3, 4])
 *				.foreach(function(x, accum) { 
 *					accum.add(x);
 *				});
 *	print(accum.value()); // displays 10
 *  
 * @classdesc
 * @param {number} initialValue
 * @param {AccumulableParam} param
 * @param {string} name human-readable name for use in Spark's web UI
 * @constructor 
 * @augments Accumulable
 */
var Accumulator = function(initialValue,param,name) {
	this.logger = Logger.getLogger("Accumulator_js");
	this.logger.debug("constructor");
	
	 Accumulable.apply(this, arguments);

};

Accumulator.prototype = Object.create(Accumulable.prototype);

Accumulator.prototype.constructor = Accumulator;



/**
 * A simpler version of {@link AccumulableParam} where the only data type you can add
 * in is the same type as the accumulated value. An implicit AccumulatorParam object needs to be
 * available when you create Accumulators of a specific type.
 *
 * @classdesc
 * @constructor
 * @private
 */


var AccumulatorParam = function(jvmObject) {
	JavaWrapper.call(this, jvmObject);
}

AccumulatorParam.prototype = Object.create(JavaWrapper.prototype);

AccumulatorParam.prototype.constructor = AccumulatorParam;



/**
 * @private 
 */
AccumulatorParam.prototype.init = function() {
throw "not implemented by ElairJS";
//   var javaObject =  this.getJavaObject().$init$();
//   return new ??(javaObject);
}


/**
 * @param {object}
 * @param {object}
 * @returns {object} 
 */
AccumulatorParam.prototype.addAccumulator = function(t1,t2) {
   var t1_uw = Utils.unwrapObject(t1);
   var t2_uw = Utils.unwrapObject(t2);
   var javaObject =  this.getJavaObject().addAccumulator(t1_uw,t2_uw);
   return Utils.javaToJs(javaObject);
}
/**
 * @constructor
 * @augments AccumulableParam
 */
var IntAccumulatorParam = function() {
	this.logger = Logger.getLogger("IntAccumulatorParam_js");
	this.logger.debug("constructor");
	var jvmObject;
	if (arguments.length == 1) {
		jvmObject = arguments[0]
	} else {
		jvmObject = new org.apache.spark.AccumulatorParam.IntAccumulatorParam$();
	}
	 
	AccumulableParam.call(this, jvmObject);

}

IntAccumulatorParam.prototype = Object.create(AccumulableParam.prototype);

IntAccumulatorParam.prototype.constructor = IntAccumulatorParam;
/**
 * @constructor
 * @augments AccumulableParam
 */
var FloatAccumulatorParam = function() {
	this.logger = Logger.getLogger("FloatAccumulatorParam_js");
	this.logger.debug("constructor");
	var jvmObject;
	if (arguments.length == 1) {
		jvmObject = arguments[0]
	} else {
		/*
		 * Note nashorn converts a JavaScript Float to a Java Double.
		 */
		jvmObject = new org.apache.spark.AccumulatorParam.DoubleAccumulatorParam$();
	}
	 
	AccumulableParam.call(this, jvmObject);

}

FloatAccumulatorParam.prototype = Object.create(AccumulableParam.prototype);

FloatAccumulatorParam.prototype.constructor = FloatAccumulatorParam;

