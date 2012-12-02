class AddBuyableToMaterials < ActiveRecord::Migration
  def change
    add_column :materials, :buyable, :integer
    add_column :materials, :buyable_type, :string
	  add_index :materials, [:buyable, :buyable_type], :name => "ion_b_t"
	  add_index :materials, [:name, :buyable, :buyable_type], :name => "ion_n_b_t", :unique => true
  end
end

