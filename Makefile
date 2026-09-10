.PHONY: frontend run clean

frontend:
	cd src/frontend && npm run dev

run:
	. .venv/bin/activate && python run.py

clean:
	@echo "Removing all __pycache__ directories..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Done."
