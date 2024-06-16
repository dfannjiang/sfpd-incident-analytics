# Define variables
VENV := venv
PYTHON := python3
PIP := $(VENV)/bin/pip
UVICORN := $(VENV)/bin/uvicorn
REQS := requirements.txt

# Default target
.PHONY: run
run: $(VENV)/bin/activate
	@echo "Starting the FastAPI server..."
	$(UVICORN) app.main:app --reload

prod: $(VENV)/bin/activate
	@echo "Starting the FastAPI server..."
	$(UVICORN) app.main:app --host=0.0.0.0 --port=${PORT}

# Create virtual environment
$(VENV)/bin/python: 
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)

# Install dependencies
$(VENV)/bin/activate: $(VENV)/bin/python $(REQS)
	@echo "Installing dependencies..."
	$(PIP) install -r $(REQS)
	@touch $(VENV)/bin/activate

# Clean up virtual environment
.PHONY: clean
clean:
	@echo "Cleaning up..."
	rm -rf $(VENV)
