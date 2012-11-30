class CreatePlants < ActiveRecord::Migration
  def change
    create_table :plants do |t|
    	t.string :name
    	t.string :country
    	t.string :state
    	t.string :city
    	t.string :address
    	t.integer :sqft
    	t.date :founding_date
    	t.date :closing_date
      t.timestamps
    end
    add_index :plants, :name
  end
end
