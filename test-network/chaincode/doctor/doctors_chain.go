package main

import (
	"encoding/json"
	"fmt"

	//"strconv"

	//"github.com/chaincode/doctor"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

//SmartContract ... The SmartContract
type SmartContract struct {
}

type Doctors struct {
	DoctorName string `json:"doctor_name"`
	DoctorId   string `json:"doctor_id"`
	Email      string `json:"doctor_email"`
	ContactNum string `json:"contact_num"`
	Address    string `json:"address"`
}

type DoctorByIdResponse struct {
	ID      string  `json:"id"`
	Request Doctors `json:"doctor"`
}

type Response struct {
	Status  string             `json:"status"`
	Message string             `json:"message"`
	Data    DoctorByIdResponse `json:"data"`
}

//var logger = shim.NewLogger("example_cc0")

//Init Function
func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) peer.Response {

	_, args := stub.GetFunctionAndParameters()
	var doctors = Doctors{
		DoctorName: args[0],
		DoctorId:   args[1],
		Email:      args[2],
		ContactNum: args[3],
		Address:    args[4]}

	doctorAsBytes, _ := json.Marshal(doctors)

	var uniqueID = args[1]

	err := stub.PutState(uniqueID, doctorAsBytes)

	if err != nil {
		fmt.Println("Error in Init")
	}

	return shim.Success([]byte("Chaincode Successfully initialized"))
}

//CreateDoctor ... this function is used to create doctors
func CreateDoctor(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}
	var doctors = Doctors{
		DoctorName: args[0],
		DoctorId:   args[1],
		Email:      args[2],
		ContactNum: args[3],
		Address:    args[4]}

	doctorAsBytes, _ := json.Marshal(doctors)

	var uniqueID = args[1]

	err := stub.PutState(uniqueID, doctorAsBytes)

	if err != nil {
		fmt.Println("Erro in create doctor")
	}

	return shim.Success(nil)
}

//GetDoctorByID ... This function will return a particular doctor
func GetDoctorByID(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	fmt.Println("Before Len")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments.Expected 1 argument")
	}

	fmt.Println("After Len")

	query := `{
				"selector": {
				   "doctor_id": {
					  "$eq": "` + args[0] + `"
				   }
				}
			 }`

	fmt.Println("Queeryy =>>>> \n" + query)

	//resultsIterator, err := stub.GetQueryResult("{\"selector\":{\"doc_type\":\"doctors\",\"_id\":{\"$eq\": \"1\"}}}")

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

	//	return shim.Error("Could not find any doctors.")

}

//Invoke function
func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	fun, args := stub.GetFunctionAndParameters()
	if fun == "CreateDoctor" {
		fmt.Println("Error occured ==> ")
		//logger.Info("########### create docs ###########")
		return CreateDoctor(stub, args)
	} else if fun == "GetDoctorByID" {
		fmt.Println("Calling get  ==> ")
		return GetDoctorByID(stub, args)
	}

	return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", fun))

}

func main() {
	err := shim.Start(new(SmartContract))

	if err != nil {
		fmt.Print(err)
	}
}
