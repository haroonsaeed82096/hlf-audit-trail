package main

import (
	"encoding/json"
	"fmt"

		//"strconv"

	
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Activities struct {
	ActivityName string `json:"activity_name"`
	ActivityId   string `json:"activity_id"`
	UserID      string `json:"user_id"`
	UserName string `json:"user_name"`
}

type ActivityByIdResponse struct {
	ID      string  `json:"id"`
	Request Activities `json:"activity"`
}

type Response struct {
	Status  string             `json:"status"`
	Message string             `json:"message"`
	Data    ActivityByIdResponse `json:"data"`
}


//Init Function
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {

	_, args := stub.GetFunctionAndParameters()
	var activities = Activities{
		ActivityName: args[0],
		ActivityId:   args[1],
		UserID:      args[2],
		UserName: args[3]}

	activitiesAsBytes, _ := json.Marshal(activities)

	var uniqueID = args[1]

	err := stub.PutState(uniqueID, activitiesAsBytes)

	if err != nil {
		fmt.Println("Error in Init")
	}

	return shim.Success([]byte("Chaincode Successfully initialized"))
}

func CreateActivity(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}
	var activities = Activities{
		ActivityName: args[0],
		ActivityId:   args[1],
		UserID:      args[2],
		UserName: args[3]}

	activitiesAsBytes, _ := json.Marshal(activities)

	var uniqueID = args[1]

	err := stub.PutState(uniqueID, activitiesAsBytes)

	if err != nil {
		fmt.Println("Erro in creating activity")
	}

	return shim.Success(nil)
}


func GetActivityByID(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	fmt.Println("Before Len")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments.Expected 1 argument")
	}

	fmt.Println("After Len")

	query := `{
				"selector": {
				   "activity_id": {
					  "$eq": "` + args[0] + `"
				   }
				}
			 }`

	fmt.Println("Queeryy =>>>> \n" + query)

	resultsIterator, err := stub.GetQueryResult(query)

	if err != nil {
		fmt.Println("Error fetching reuslts")
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	fmt.Println("After results")
	// counter := 0
	//var resultKV
	for resultsIterator.HasNext() {
		fmt.Println("Inside hasnext")
		// Get the next element
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			fmt.Println("Err=" + err.Error())
			return shim.Success([]byte("Error in parse: " + err.Error()))
		}

		// Increment the counter
		// counter++
		key := queryResponse.GetKey()
		value := string(queryResponse.GetValue())

		// Print the receieved result on the console
		fmt.Printf("Result#   %s   %s \n\n", key, value)
		b, je := json.Marshal(value)
		if je != nil {
			return shim.Error(je.Error())
		}

		return shim.Success(b)
	}

	// Close the iterator
	resultsIterator.Close()
	return shim.Success(nil)

}

//Invoke function
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	fun, args := stub.GetFunctionAndParameters()
	if fun == "CreateActivity" {
		fmt.Println("Error occured ==> ")
		//logger.Info("########### create docs ###########")
		return CreateActivity(stub, args)
	} else if fun == "GetActivityByID" {
		fmt.Println("Calling get  ==> ")
		return GetActivityByID(stub, args)
	}

	return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", fun))

}

func main() {
	err := shim.Start(new(SmartContract))

	if err != nil {
		fmt.Print(err)
	}
}
